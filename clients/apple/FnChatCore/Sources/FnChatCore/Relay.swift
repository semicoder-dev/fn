import CloudKit
import CryptoKit
import FIACloudKit
import Foundation

public struct RelayApplication: Codable, Identifiable, Sendable {
  public var id: String
  public var name: String
  public var state: String
}
public struct RelayHost: Codable, Identifiable, Sendable {
  public var id: String
  public var name: String
  public var updatedAt: Double
  public var applications: [RelayApplication]
}
public struct RelayRequest: Codable, Identifiable, Sendable, Equatable {
  public var id: String
  public var hostId: String
  public var instanceId: String
  public var conversationId: String
  public var text: String
  public var locale: String
  public var createdAt: Double
  public init(
    hostId: String, instanceId: String, conversationId: String, text: String, locale: String
  ) {
    id = UUID().uuidString.lowercased()
    self.hostId = hostId
    self.instanceId = instanceId
    self.conversationId = conversationId
    self.text = text
    self.locale = locale
    createdAt = Date().timeIntervalSince1970 * 1000
  }
}
public struct RelayStatus: Codable, Identifiable, Sendable {
  public var id: String
  public var hostId: String
  public var instanceId: String
  public var conversationId: String
  public var text: String
  public var locale: String
  public var createdAt: Double
  public var status: String
  public var reply: String?
  public var error: String?
  public var replyParts: Int?
}
public struct RelayReply: Codable, Sendable {
  public var messageId: String
  public var hostId: String
  public var index: Int
  public var text: String
}
public struct RelayRecord: Codable, Sendable {
  public var id: String
  public var type: String
  public var payload: String
  public var systemFields: Data?
}
public struct RelayChanges: Sendable {
  public var records: [RelayRecord]
  public var deleted: [String]
  public var token: Data?
  public var more: Bool
}
public enum RelayError: Error { case invalidMessage, accountChanged, configuration }
@MainActor public protocol RelayTransport {
  func accountKey() async throws -> String
  func prepare() async throws
  func changes(_ token: Data?) async throws -> RelayChanges
  func send(_ record: RelayRecord) async throws -> RelayRecord
}

@MainActor public final class PhoneStore {
  public struct Document: Codable {
    public var records: [String: RelayRecord] = [:]
    public var outbox: [RelayRequest] = []
    public var requests: [RelayRequest] = []
    public var conversations: [String: String] = [:]
    public var token: Data?
    public var deviceId = UUID().uuidString.lowercased()
  }
  public private(set) var document: Document
  private let file: URL
  public init(file: URL) throws {
    self.file = file
    document =
      FileManager.default.fileExists(atPath: file.path)
      ? try JSONDecoder().decode(Document.self, from: Data(contentsOf: file)) : Document()
  }
  public static func file(root: URL, container: String, account: String) -> URL {
    let hash = SHA256.hash(data: Data((container + ":" + account).utf8)).map {
      String(format: "%02x", $0)
    }.joined()
    return root.appending(path: "relay/" + hash + "/messages.json")
  }
  private func commit(_ update: (inout Document) throws -> Void) throws {
    var next = document
    try update(&next)
    try FileManager.default.createDirectory(
      at: file.deletingLastPathComponent(), withIntermediateDirectories: true,
      attributes: [.posixPermissions: 0o700])
    try JSONEncoder().encode(next).write(to: file, options: .atomic)
    try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
    document = next
  }
  public func enqueue(hostId: String, instanceId: String, text: String, locale: String) throws
    -> RelayRequest
  {
    guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf16.count <= 20000
    else { throw RelayError.invalidMessage }
    let key = hostId + ":" + instanceId
    let conversation = document.conversations[key] ?? UUID().uuidString.lowercased()
    let request = RelayRequest(
      hostId: hostId, instanceId: instanceId, conversationId: conversation, text: text,
      locale: locale)
    guard try JSONEncoder().encode(request).count <= 60000 else { throw RelayError.invalidMessage }
    try commit { value in
      value.conversations[key] = conversation
      value.requests.append(request)
      value.outbox.append(request)
    }
    return request
  }
  public func merge(_ page: RelayChanges) throws {
    try commit { value in
      for record in page.records {
        if record.type == "FnRelayHost" {
          _ = try JSONDecoder().decode(RelayHost.self, from: Data(record.payload.utf8))
        }
        if record.type == "FnRelayStatus" {
          _ = try JSONDecoder().decode(RelayStatus.self, from: Data(record.payload.utf8))
        }
        if record.type == "FnRelayReply" {
          _ = try JSONDecoder().decode(RelayReply.self, from: Data(record.payload.utf8))
        }
        value.records[record.id] = record
      }
      for id in page.deleted { value.records.removeValue(forKey: id) }
      value.token = page.token
    }
  }
  public func acknowledge(_ record: RelayRecord, id: String) throws {
    try commit { value in
      value.records[record.id] = record
      value.outbox.removeAll { $0.id == id }
    }
  }
  public func resetToken() throws { try commit { $0.token = nil } }
  public func hosts() -> [RelayHost] {
    document.records.values.filter { $0.type == "FnRelayHost" }.compactMap {
      try? JSONDecoder().decode(RelayHost.self, from: Data($0.payload.utf8))
    }.sorted { $0.name < $1.name }
  }
  public func messages(hostId: String, instanceId: String) -> [RelayStatus] {
    var values = Dictionary(
      uniqueKeysWithValues: document.records.values.filter { $0.type == "FnRelayStatus" }.compactMap
      { try? JSONDecoder().decode(RelayStatus.self, from: Data($0.payload.utf8)) }.map {
        ($0.id, $0)
      })
    for item in document.requests {
      if values[item.id] == nil {
        values[item.id] = RelayStatus(
          id: item.id, hostId: item.hostId, instanceId: item.instanceId,
          conversationId: item.conversationId, text: item.text, locale: item.locale,
          createdAt: item.createdAt,
          status: document.outbox.contains { $0.id == item.id } ? "queued" : "waiting")
      } else {
        values[item.id]?.text = item.text
      }
    }
    // Requests also arrive through CloudKit, so a second phone can read history.
    for record in document.records.values where record.type == "FnRelayRequest" {
      if let request = try? JSONDecoder().decode(RelayRequest.self, from: Data(record.payload.utf8))
      {
        values[request.id]?.text = request.text
      }
    }
    for id in Array(values.keys) {
      guard var message = values[id], let count = message.replyParts, count > 0, count <= 32 else {
        continue
      }
      var parts: [String] = []
      for index in 0..<count {
        guard let record = document.records["reply-" + id + "-" + String(index)],
          let part = try? JSONDecoder().decode(RelayReply.self, from: Data(record.payload.utf8)),
          part.messageId == id, part.hostId == message.hostId, part.index == index
        else { break }
        parts.append(part.text)
      }
      if parts.count == count {
        message.reply = parts.joined()
      } else if message.status == "completed" {
        message.status = "processing"
      }
      values[id] = message
    }
    return values.values.filter { $0.hostId == hostId && $0.instanceId == instanceId }.sorted {
      $0.createdAt < $1.createdAt
    }
  }
}

@MainActor public final class AppleRelayTransport: RelayTransport {
  private let cloud: CloudKitTransport
  private let zone: CKRecordZone.ID
  public init(container: String, environment: String) throws {
    let environment = environment == "production" ? "production" : "development"
    guard container == "iCloud.com.semicoder.fn." + environment else {
      throw RelayError.configuration
    }
    cloud = CloudKitTransport(containerIdentifier: container)
    zone = .init(zoneName: "fn-app-relay-" + environment)
  }
  public func accountKey() async throws -> String { try await cloud.accountKey() }
  public func prepare() async throws {
    _ = try await cloud.ensureZone(zone.zoneName)
    try await cloud.subscribeToZone(id: "fn-phone-relay-" + zone.zoneName, zoneID: zone)
  }
  private func local(_ record: CKRecord) throws -> RelayRecord {
    guard let payload = record["payload"] as? String else { throw RelayError.invalidMessage }
    let coder = NSKeyedArchiver(requiringSecureCoding: true)
    record.encodeSystemFields(with: coder)
    coder.finishEncoding()
    return RelayRecord(
      id: record.recordID.recordName, type: record.recordType, payload: payload,
      systemFields: coder.encodedData)
  }
  public func changes(_ token: Data?) async throws -> RelayChanges {
    let result = try await cloud.changes(zoneID: zone, since: CloudKitTransport.decodeToken(token))
    return try RelayChanges(
      records: result.records.map(local), deleted: result.deletedIDs.map(\.recordName),
      token: CloudKitTransport.encodeToken(result.token), more: result.moreComing)
  }
  public func send(_ value: RelayRecord) async throws -> RelayRecord {
    guard value.type == "FnRelayRequest" else { throw RelayError.invalidMessage }
    // Stable IDs make a lost acknowledgement safe to retry.
    let id = CKRecord.ID(recordName: value.id, zoneID: zone)
    do {
      let existing = try await cloud.record(id)
      guard existing.recordType == value.type, existing["payload"] as? String == value.payload
      else { throw RelayError.invalidMessage }
      return try local(existing)
    } catch let error as CKError where error.code == .unknownItem {}
    let record = CKRecord(recordType: value.type, recordID: id)
    record["payload"] = value.payload as CKRecordValue
    guard let result = try await cloud.commit(saving: [record]).first else {
      throw RelayError.invalidMessage
    }
    return try local(result)
  }
}

@MainActor public final class PhoneSync {
  public private(set) var store: PhoneStore?
  public var changed: (() -> Void)?
  public var identityChanged: (() -> Void)?
  public private(set) var error: String?
  private var transport: (any RelayTransport)?
  private var account: String?
  private var syncing = false
  public let root: URL
  public init(root: URL) { self.root = root }
  public func connect(container: String, transport: any RelayTransport) async throws {
    guard !syncing else { return }
    let key = try await transport.accountKey()
    try await transport.prepare()
    guard try await transport.accountKey() == key else { throw RelayError.accountChanged }
    if account != key {
      store = nil
      identityChanged?()
    }
    store = try PhoneStore(file: PhoneStore.file(root: root, container: container, account: key))
    account = key
    self.transport = transport
    await sync()
  }
  public func disconnect() {
    store = nil
    account = nil
    transport = nil
    identityChanged?()
    changed?()
  }
  public func sync() async {
    guard !syncing, let transport, let store, let account else { return }
    syncing = true
    defer {
      syncing = false
      changed?()
    }
    do {
      guard try await transport.accountKey() == account else {
        disconnect()
        throw RelayError.accountChanged
      }
      var more = true
      while more {
        let page: RelayChanges
        do { page = try await transport.changes(store.document.token) } catch let error as CKError
          where error.code == .changeTokenExpired
        {
          try store.resetToken()
          continue
        }
        guard self.store === store else { return }
        try store.merge(page)
        more = page.more
      }
      for request in store.document.outbox {
        guard try await transport.accountKey() == account, self.store === store else {
          throw RelayError.accountChanged
        }
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        let payload = String(decoding: try encoder.encode(request), as: UTF8.self)
        let saved = try await transport.send(
          RelayRecord(id: "request-" + request.id, type: "FnRelayRequest", payload: payload))
        guard self.store === store else { return }
        try store.acknowledge(saved, id: request.id)
      }
      error = nil
    } catch { self.error = error.localizedDescription }
  }
}
public enum ChatNotification {
  public static func messageID(from info: [AnyHashable: Any]) -> String? {
    (CKNotification(fromRemoteNotificationDictionary: info) as? CKQueryNotification)?.recordID?
      .recordName
  }
}
