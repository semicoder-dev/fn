import CloudKit
import Foundation

@MainActor public final class SessionSync {
  public private(set) var store: SessionSQLiteStore?
  public private(set) var status = "尚未连接 iCloud"
  public var changed: (() -> Void)?
  public var identityChanged: (() -> Void)?
  private let root: URL
  private var transport: (any ChatTransport)?
  private var account: String?
  private var epoch = 0
  private var syncing = false
  private var again = false
  private var subscriptionID: String?
  private var subscribed = false
  public init(root: URL) { self.root = root }
  public func disconnect() {
    epoch += 1; store = nil; transport = nil; account = nil; subscribed = false
    status = "iCloud 账号已变化"
    identityChanged?(); changed?()
  }
  private func check(_ expected: Int) throws {
    if epoch != expected { throw SQLiteFailure(message: "iCloud 账号已变化") }
  }
  public func connect(container: String, environment: String, bundleID: String, transport supplied: (any ChatTransport)? = nil) async {
    let expected = epoch
    do {
      let cloud: any ChatTransport = try supplied ?? SessionAppleTransport(container: container, environment: environment)
      let key = try await cloud.prepare()
      try check(expected)
      let file = try SessionSQLiteStore.accountFile(root: root, environment: environment, container: container, account: key)
      store = try SessionSQLiteStore(path: file.path)
      transport = cloud; account = key; subscriptionID = bundleID
      await sync()
    } catch {
      if expected == epoch { status = error.localizedDescription; changed?() }
    }
  }
  public func records<T: Decodable>(_ type: String, as: T.Type) -> [T] {
    ((try? store?.records(type: type)) ?? []).compactMap { try? JSONDecoder().decode(T.self, from: Data($0.payload.utf8)) }
  }
  public func hosts() -> [SessionHost] { records("FnSessionHost", as: SessionHost.self).sorted { $0.name < $1.name } }
  public func endpoints(host: String) -> [SessionEndpoint] { records("FnSessionEndpoint", as: SessionEndpoint.self).filter { $0.hostId == host && $0.enabled } }
  public func connections(host: String) -> [SessionConnection] { records("FnSessionConnection", as: SessionConnection.self).filter { $0.hostId == host && $0.enabled && !$0.models.isEmpty } }
  public func sessions(host: String) -> [SessionSummary] {
    records("FnSessionSummary", as: SessionSummary.self).filter { $0.hostId == host }.sorted { $0.session.createdAt > $1.session.createdAt }
  }
  public func items(host: String, session: String) -> [SessionDisplayItem] {
    (records("FnSessionItem", as: SessionItemRecord.self) + records("FnSessionReply", as: SessionItemRecord.self))
      .filter { $0.hostId == host && $0.sessionId == session }.map(\.item).sorted { $0.seq < $1.seq }
  }
  private func readKey(host: String, session: String) -> String {
    "read:" + String(decoding: try! JSONEncoder().encode([host, session]), as: UTF8.self)
  }
  public func readSequence(host: String, session: String) -> Int {
    let remote = sessions(host: host).first { $0.id == session }?.readSeq ?? -1
    let local = Int(localValue(readKey(host: host, session: session)) ?? "-1") ?? -1
    return max(remote, local)
  }
  public func unreadCount(host: String, session: String) -> Int {
    let seq = readSequence(host: host, session: session)
    return items(host: host, session: session).filter { $0.kind == "assistant" && $0.seq > seq }.count
  }
  public func markRead(host: String, session: String) throws {
    // Only acknowledge content already received; a summary may arrive before its items.
    guard let seq = items(host: host, session: session).last?.seq,
      seq > readSequence(host: host, session: session) else { return }
    _ = try enqueue(host: host, action: "read", fields: ["sessionId": session, "seq": seq])
    try store?.setMeta(readKey(host: host, session: session), String(seq))
    changed?()
  }
  public func cards(host: String, session: String) -> [SessionCardRecord] {
    records("FnSessionCard", as: SessionCardRecord.self).filter { $0.hostId == host && $0.sessionId == session }.sorted {
      $0.card.createdAt == $1.card.createdAt ? $0.id < $1.id : $0.card.createdAt < $1.card.createdAt
    }
  }
  public func pendingCard(host: String, id: String) -> Bool {
    struct Command: Decodable { let id, hostId, cardId, action: String }
    let finished = Set(results().filter { $0.hostId == host }.map(\.id))
    return records("FnSessionCommand", as: Command.self).contains { $0.hostId == host && $0.cardId == id && $0.action == "card" && !finished.contains($0.id) }
  }
  public func cardAvailable(_ record: SessionCardRecord) -> Bool {
    guard record.card.state == "pending", record.card.expiresAt > Int64(Date().timeIntervalSince1970 * 1000),
      !pendingCard(host: record.hostId, id: record.id),
      let summary = sessions(host: record.hostId).first(where: { $0.id == record.sessionId }) else { return false }
    return endpoints(host: record.hostId).contains { $0.appId == summary.session.appId && $0.endpointId == summary.session.endpointId }
  }
  public func respondCard(_ record: SessionCardRecord, action: String, values: [String: JSONValue]) throws {
    guard let current = cards(host: record.hostId, session: record.sessionId).first(where: { $0.id == record.id }), cardAvailable(current) else { throw SQLiteFailure(message: "卡片已处理、过期或应用不可用") }
    try current.card.card.validate(actionId: action, values: values)
    let bytes = try JSONEncoder().encode(values)
    guard bytes.count <= 32768 else { throw ChatError.oversized }
    let object = try JSONSerialization.jsonObject(with: bytes)
    _ = try enqueue(host: record.hostId, action: "card", fields: ["sessionId": record.sessionId, "cardId": record.id, "actionId": action, "values": object])
  }
  public func results() -> [SessionCommandResult] { records("FnSessionResult", as: SessionCommandResult.self) }
  public var pendingCount: Int { (try? store?.pending().count) ?? 0 }
  public var failures: [String] {
    ((try? store?.failures()) ?? []) + results().filter { $0.status != "completed" }.compactMap(\.error)
  }
  public func localValue(_ key: String) -> String? { try? store?.meta(key) }
  public func setLocalValue(_ key: String, _ value: String) { try? store?.setMeta(key, value) }
  public func enqueue(host: String, action: String, fields: [String: Any]) throws -> String {
    guard let store else { throw SQLiteFailure(message: "尚未连接") }
    var object = fields
    let id = UUID().uuidString
    object["protocolVersion"] = 3; object["id"] = id; object["hostId"] = host
    object["deviceId"] = store.deviceId; object["createdAt"] = Int64(Date().timeIntervalSince1970 * 1000)
    object["action"] = action
    let data = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys, .withoutEscapingSlashes])
    try SessionContract.validate(type: "FnSessionCommand", data: data)
    let record = try ChatRecord(id: SessionContract.identity(type: "FnSessionCommand", data: data),
      type: "FnSessionCommand", payload: String(decoding: data, as: UTF8.self))
    try store.enqueue(.init(id: id, kind: "command", payload: String(decoding: JSONEncoder().encode(record), as: UTF8.self)), records: [record])
    changed?()
    Task { await sync() }
    return id
  }
  public func sync() async {
    guard let transport, let store, let account else { return }
    if syncing { again = true; return }
    syncing = true
    let expected = epoch
    defer {
      syncing = false
      if epoch == expected { changed?() }
      if again { again = false; Task { await self.sync() } }
    }
    do {
      guard try await transport.currentAccount() == account else { disconnect(); return }
      try check(expected)
      var cursor = try store.meta("cursor")
      var reset = false
      repeat {
        let page: ChatChanges
        do { page = try await transport.changes(cursor) }
        catch let error as CKError where error.code == .changeTokenExpired {
          cursor = nil; reset = true; page = try await transport.changes(nil)
        }
        try check(expected)
        try store.apply(page.records, deleted: page.deleted, token: page.token, reset: reset)
        cursor = page.token; reset = false
        if !page.more { break }
      } while true
      for intent in try store.pending() {
        try check(expected)
        let record = try JSONDecoder().decode(ChatRecord.self, from: Data(intent.payload.utf8))
        let previous = try await transport.read(record.id)
        try check(expected)
        if let previous {
          let old = try JSONDecoder().decode(JSONValue.self, from: Data(previous.payload.utf8))
          let new = try JSONDecoder().decode(JSONValue.self, from: Data(record.payload.utf8))
          guard old == new else { throw SQLiteFailure(message: "命令标识冲突，未覆盖远端命令") }
          try store.acknowledge(intent.id, records: [previous])
        } else {
          let saved = try await transport.commit([record]); try check(expected)
          guard saved.contains(where: { $0.id == record.id }) else { throw SQLiteFailure(message: "CloudKit 未确认命令") }
          try store.acknowledge(intent.id, records: saved)
        }
      }
      status = "同步成功"
      // A fresh development zone may not have the reply record type yet.
      // Notification setup must never prevent initial catalog/command sync.
      if !subscribed, let subscriptionID {
        do {
          try await transport.subscribe(subscriptionID); try check(expected); subscribed = true
        } catch { status = "同步成功；通知暂未就绪：" + error.localizedDescription }
      }
    } catch {
      if epoch == expected { status = error.localizedDescription }
    }
  }
}
