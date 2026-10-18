import CloudKit
import Foundation

public enum CloudTransportError: Error, LocalizedError {
    case accountUnavailable(CKAccountStatus)
    case invalidBatch
    case incompleteResult

    public var errorDescription: String? {
        switch self {
        case .accountUnavailable(let status): "iCloud 账号不可用（\(status.rawValue)）"
        case .invalidBatch: "原子提交必须位于同一个 zone，且记录 ID 不能重复"
        case .incompleteResult: "CloudKit 未返回全部记录的处理结果"
        }
    }
}

/// Explicit CloudKit transport only. Callers own persistence, account isolation and business policy.
/// Main-actor isolation also keeps CKRecord instances from being mutated during a submission.
@MainActor
public final class CloudKitTransport {
    public let container: CKContainer
    public let database: CKDatabase

    public init(containerIdentifier: String) {
        container = CKContainer(identifier: containerIdentifier)
        database = container.privateCloudDatabase
    }

    /// Opaque account key, not an email address. Never send a previous account's outbox under a new key.
    public func accountKey() async throws -> String {
        let status = try await container.accountStatus()
        guard status == .available else { throw CloudTransportError.accountUnavailable(status) }
        return try await container.userRecordID().recordName
    }

    public func ensureZone(_ name: String) async throws -> CKRecordZone.ID {
        let zone = CKRecordZone(zoneName: name)
        return try await database.save(zone).zoneID
    }

    public func record(_ id: CKRecord.ID) async throws -> CKRecord {
        try await database.record(for: id)
    }

    public static func validateBatch(saving records: [CKRecord], deleting ids: [CKRecord.ID]) throws {
        let allIDs = records.map(\.recordID) + ids
        guard !allIDs.isEmpty, allIDs.count <= 200,
              Set(allIDs).count == allIDs.count,
              Set(allIDs.map(\.zoneID)).count == 1
        else { throw CloudTransportError.invalidBatch }
    }

    /// All results are checked: CloudKit can return individual failures without throwing at operation level.
    public func commit(saving records: [CKRecord], deleting ids: [CKRecord.ID] = []) async throws -> [CKRecord] {
        try Self.validateBatch(saving: records, deleting: ids)
        let result = try await database.modifyRecords(
            saving: records, deleting: ids, savePolicy: .ifServerRecordUnchanged, atomically: true)
        // Surface the underlying conflict before batchRequestFailed on another record.
        let errors = result.saveResults.values.compactMap { value -> Error? in
            if case .failure(let error) = value { return error }; return nil
        } + result.deleteResults.values.compactMap { value -> Error? in
            if case .failure(let error) = value { return error }; return nil
        }
        if let conflict = errors.first(where: { ($0 as? CKError)?.code == .serverRecordChanged }) { throw conflict }
        if let error = errors.first { throw error }
        guard result.saveResults.count == records.count, result.deleteResults.count == ids.count
        else { throw CloudTransportError.incompleteResult }
        return try records.map { record in
            guard let saved = result.saveResults[record.recordID] else { throw CloudTransportError.incompleteResult }
            return try saved.get()
        }
    }

    public struct Changes {
        public let records: [CKRecord]
        public let deletedIDs: [CKRecord.ID]
        public let token: CKServerChangeToken
        public let moreComing: Bool
    }

    /// Persist the records and token together, only after decoding/validation succeeds.
    public func changes(zoneID: CKRecordZone.ID, since token: CKServerChangeToken?, resultsLimit: Int = 100) async throws -> Changes {
        let page = try await database.recordZoneChanges(inZoneWith: zoneID, since: token, resultsLimit: max(1, min(100, resultsLimit)))
        return try Changes(
            records: page.modificationResultsByID.values.map { try $0.get().record },
            deletedIDs: page.deletions.map(\.recordID), token: page.changeToken, moreComing: page.moreComing)
    }

    /// Visible notifications for record creation; state/receipt writes should use other record types.
    public func subscribeToCreations(id: String, recordType: String, zoneID: CKRecordZone.ID,
                                     title: String, body: String) async throws {
        let subscription = CKQuerySubscription(recordType: recordType, predicate: NSPredicate(value: true),
                                               subscriptionID: id, options: [.firesOnRecordCreation])
        subscription.zoneID = zoneID
        let info = CKSubscription.NotificationInfo()
        info.title = title
        info.alertBody = body
        info.soundName = "default"
        info.shouldSendContentAvailable = true
        subscription.notificationInfo = info
        _ = try await database.save(subscription)
    }

    public static func encodeToken(_ token: CKServerChangeToken) throws -> Data {
        try NSKeyedArchiver.archivedData(withRootObject: token, requiringSecureCoding: true)
    }

    /// Silent hints for every zone change, including receipts and request state updates.
    public func subscribeToZone(id: String, zoneID: CKRecordZone.ID) async throws {
        let subscription = CKRecordZoneSubscription(zoneID: zoneID, subscriptionID: id)
        let info = CKSubscription.NotificationInfo()
        info.shouldSendContentAvailable = true
        subscription.notificationInfo = info
        _ = try await database.save(subscription)
    }

    public func removeSubscription(id: String) async throws {
        do { _ = try await database.deleteSubscription(withID: id) }
        catch let error as CKError where error.code == .unknownItem { }
    }

    public static func decodeToken(_ data: Data?) throws -> CKServerChangeToken? {
        guard let data else { return nil }
        return try NSKeyedUnarchiver.unarchivedObject(ofClass: CKServerChangeToken.self, from: data)
    }
}
