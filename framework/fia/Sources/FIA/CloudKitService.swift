import AppKit
import CloudKit
import FIACloudKit
import FIACore
import Foundation
import UserNotifications

/// String fields carry versioned JSON without coupling FIA to an application's record schema.
struct CloudRecord: Codable, Sendable {
    let id: String
    let type: String
    let fields: [String: String]
    let systemFields: String?
}
struct CloudScope: Codable, Sendable {
    let container: String
    let accountKey: String
    let zone: String
}
struct CloudAccountInput: Codable, Sendable { let container: String }
struct CloudAccount: Codable, Sendable { let status: Int; let accountKey: String? }
struct CloudReadInput: Codable, Sendable { let scope: CloudScope; let id: String }
struct CloudCommitInput: Codable, Sendable { let scope: CloudScope; let records: [CloudRecord]; let deletedIDs: [String] }
struct CloudChangesInput: Codable, Sendable { let scope: CloudScope; let token: String? }
struct CloudChanges: Codable, Sendable {
    let records: [CloudRecord]
    let deletedIDs: [String]
    let token: String
    let moreComing: Bool
}
struct CloudSubscriptionInput: Codable, Sendable {
    let scope: CloudScope
    let id: String
    let recordType: String
    let title: String
    let body: String
}

@MainActor
final class CloudKitService: NSObject, UNUserNotificationCenterDelegate {
    let containers: Set<String>
    var onChange: (([String: String]) -> Void)?
    private var accountGeneration = 0
    private final class Observation: @unchecked Sendable {
        let token: any NSObjectProtocol
        init(_ token: any NSObjectProtocol) { self.token = token }
        deinit { NotificationCenter.default.removeObserver(token) }
    }
    private var accountObserver: Observation?

    init(containers: Set<String>) {
        self.containers = containers
        super.init()
        accountObserver = Observation(NotificationCenter.default.addObserver(forName: .CKAccountChanged, object: nil, queue: .main) { [weak self] _ in
            Task { @MainActor in
                self?.accountGeneration += 1
                self?.onChange?(["reason": "accountChanged"])
            }
        })
    }

    private func client(_ container: String) throws -> CloudKitTransport {
        guard containers.contains(container) else {
            throw FIAError(code: .capabilityUnavailable, component: "cloudKit", message: "CloudKit container is not enabled in this signed application")
        }
        return CloudKitTransport(containerIdentifier: container)
    }

    private func scoped(_ scope: CloudScope) async throws -> CloudKitTransport {
        guard !scope.zone.isEmpty, scope.zone.utf8.count <= 200, !scope.accountKey.isEmpty else { throw invalid("Invalid CloudKit scope") }
        let generation = accountGeneration
        let transport = try client(scope.container)
        guard try await transport.accountKey() == scope.accountKey, generation == accountGeneration else {
            throw FIAError(code: .conflict, component: "cloudKit", message: "iCloud account changed; isolate the previous account's queue", recoverable: true, details: .object(["reason": .string("accountChanged")]))
        }
        try Task.checkCancellation()
        return transport
    }

    static func encode(_ record: CKRecord) throws -> CloudRecord {
        var fields: [String: String] = [:]
        for key in record.allKeys() {
            guard let value = record[key] as? String else { throw invalid("CloudKit bridge supports string fields only") }
            fields[key] = value
        }
        guard fields.values.reduce(0, { $0 + $1.utf8.count }) <= 65536 else { throw invalid("CloudKit record exceeds 64 KiB") }
        let archiver = NSKeyedArchiver(requiringSecureCoding: true)
        record.encodeSystemFields(with: archiver)
        archiver.finishEncoding()
        let value = CloudRecord(id: record.recordID.recordName, type: record.recordType, fields: fields, systemFields: archiver.encodedData.base64EncodedString())
        guard try JSONEncoder().encode(value).count <= 450000 else { throw invalid("CloudKit record exceeds native frame budget") }
        return value
    }

    static func decode(_ value: CloudRecord, zone: CKRecordZone.ID) throws -> CKRecord {
        guard !value.id.isEmpty, value.id.utf8.count <= 255, !value.type.isEmpty, value.type.utf8.count <= 128,
              value.fields.count <= 32, value.fields.values.reduce(0, { $0 + $1.utf8.count }) <= 65536,
              value.fields.keys.allSatisfy({ !$0.isEmpty && $0.utf8.count <= 128 }) else { throw invalid("Invalid CloudKit record or size") }
        let record: CKRecord
        if let encoded = value.systemFields {
            guard encoded.utf8.count <= 16384, let data = Data(base64Encoded: encoded) else { throw invalid("Invalid CloudKit system fields") }
            let decoder = try NSKeyedUnarchiver(forReadingFrom: data)
            decoder.requiresSecureCoding = true
            defer { decoder.finishDecoding() }
            guard let restored = CKRecord(coder: decoder), restored.recordID.zoneID == zone,
                  restored.recordID.recordName == value.id, restored.recordType == value.type else { throw invalid("CloudKit system fields do not match record identity") }
            record = restored
        } else { record = CKRecord(recordType: value.type, recordID: .init(recordName: value.id, zoneID: zone)) }
        for key in value.fields.keys { record[key] = value.fields[key]! as CKRecordValue }
        return record
    }

    private static func invalid(_ message: String) -> FIAError {
        FIAError(code: .invalidArgument, component: "cloudKit", message: message)
    }
    private func invalid(_ message: String) -> FIAError { Self.invalid(message) }

    private func perform<T: Sendable>(_ operation: @MainActor () async throws -> T) async throws -> T {
        do { return try await operation() }
        catch let error as CKError {
            var details: [String: FIAJSONValue] = ["cloudKitCode": .number(Double(error.code.rawValue))]
            if let delay = error.retryAfterSeconds { details["retryAfterSeconds"] = .number(delay) }
            let reason: String
            switch error.code {
            case .serverRecordChanged: reason = "serverRecordChanged"
            case .changeTokenExpired: reason = "changeTokenExpired"
            case .unknownItem: reason = "unknownItem"
            case .quotaExceeded: reason = "quotaExceeded"
            case .notAuthenticated: reason = "notAuthenticated"
            default: reason = "cloudKitFailure"
            }
            details["reason"] = .string(reason)
            throw FIAError(code: error.code == .serverRecordChanged ? .conflict : .nativeFailure,
                           component: "cloudKit", message: error.localizedDescription, recoverable: true, details: .object(details))
        }
    }

    func register(in registry: NativeMethodRegistry) {
        registry.register("cloudKit.account", input: CloudAccountInput.self, output: CloudAccount.self) { input in
            try await self.perform {
                let transport = try self.client(input.container)
                let status = try await transport.container.accountStatus()
                return CloudAccount(status: status.rawValue, accountKey: status == .available ? try await transport.accountKey() : nil)
            }
        }
        registry.register("cloudKit.ensureZone", input: CloudScope.self, output: FIAEmpty.self) { scope in
            try await self.perform {
                let client = try await self.scoped(scope)
                _ = try await client.ensureZone(scope.zone)
                return FIAEmpty()
            }
        }
        registry.register("cloudKit.read", input: CloudReadInput.self, output: CloudRecord.self) { input in
            try await self.perform {
                let client = try await self.scoped(input.scope)
                return try Self.encode(try await client.record(.init(recordName: input.id, zoneID: .init(zoneName: input.scope.zone))))
            }
        }
        registry.register("cloudKit.commit", input: CloudCommitInput.self, output: [CloudRecord].self) { input in
            try await self.perform {
                guard input.records.count + input.deletedIDs.count <= 2 else { throw Self.invalid("CloudKit bridge batch exceeds 2 records") }
                let client = try await self.scoped(input.scope)
                let zone = CKRecordZone.ID(zoneName: input.scope.zone)
                let records = try input.records.map { try Self.decode($0, zone: zone) }
                return try await client.commit(saving: records, deleting: input.deletedIDs.map { .init(recordName: $0, zoneID: zone) }).map { try Self.encode($0) }
            }
        }
        registry.register("cloudKit.changes", input: CloudChangesInput.self, output: CloudChanges.self) { input in
            try await self.perform {
                let client = try await self.scoped(input.scope)
                var token: CKServerChangeToken?
                if let value = input.token {
                    guard value.utf8.count <= 16384, let data = Data(base64Encoded: value) else { throw Self.invalid("Invalid CloudKit cursor") }
                    token = try CloudKitTransport.decodeToken(data)
                }
                // Two bounded records keep native JSON frames below the 1 MiB transport limit.
                let page = try await client.changes(zoneID: .init(zoneName: input.scope.zone), since: token, resultsLimit: 2)
                return try CloudChanges(records: page.records.map { try Self.encode($0) }, deletedIDs: page.deletedIDs.map(\.recordName),
                                        token: CloudKitTransport.encodeToken(page.token).base64EncodedString(), moreComing: page.moreComing)
            }
        }
        registry.register("cloudKit.subscribe", input: CloudSubscriptionInput.self, output: FIAEmpty.self) { input in
            try await self.perform {
                let client = try await self.scoped(input.scope)
                try await client.subscribeToCreations(id: input.id, recordType: input.recordType, zoneID: .init(zoneName: input.scope.zone), title: input.title, body: input.body)
                return FIAEmpty()
            }
        }
        registry.register("cloudKit.registerPush", input: FIAEmpty.self, output: FIAEmpty.self) { _ in
            await self.registerPush()
            return FIAEmpty()
        }
        registry.register("cloudKit.subscribeZone", input: CloudReadInput.self, output: FIAEmpty.self) { input in
            try await self.perform {
                let client = try await self.scoped(input.scope)
                try await client.subscribeToZone(id: input.id, zoneID: .init(zoneName: input.scope.zone))
                return FIAEmpty()
            }
        }
        registry.register("cloudKit.unsubscribe", input: CloudReadInput.self, output: FIAEmpty.self) { input in
            try await self.perform {
                let client = try await self.scoped(input.scope)
                try await client.removeSubscription(id: input.id)
                return FIAEmpty()
            }
        }
    }

    private func registerPush() {
        if !containers.isEmpty {
            UNUserNotificationCenter.current().delegate = self
            NSApplication.shared.registerForRemoteNotifications()
        }
    }
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
        let id = response.notification.request.identifier
        let recordID = (CKNotification(fromRemoteNotificationDictionary: response.notification.request.content.userInfo) as? CKQueryNotification)?.recordID?.recordName
        await openedNotification(id: id, recordID: recordID)
    }
    private func openedNotification(id: String, recordID: String?) {
        var event = ["reason": "notificationOpened", "notificationID": id]
        if let recordID { event["recordID"] = recordID }
        onChange?(event)
    }
    func receivedPush(_ userInfo: [String: Any]) {
        guard !containers.isEmpty, CKNotification(fromRemoteNotificationDictionary: userInfo) != nil else { return }
        onChange?(["reason": "remoteNotification"])
    }
    func registeredPush(error: Error? = nil) {
        onChange?(["reason": error == nil ? "pushRegistered" : "pushRegistrationFailed", "message": error?.localizedDescription ?? ""])
    }
}
