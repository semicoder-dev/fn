import CloudKit
import Foundation
import UserNotifications

@MainActor public final class ChatSync {
  public private(set) var store: SQLiteStore?
  public private(set) var status = "尚未连接 iCloud"
  public var changed: (() -> Void)?
  public var identityChanged: (() -> Void)?
  private let root: URL
  private var transport: (any ChatTransport)?
  private var account: String?
  private var generation = 0
  private var syncing = false
  private var again = false
  private var retry: Task<Void, Never>?
  private var subscriptionID: String?
  private var subscribed = false
  public init(root: URL) { self.root = root }
  public func disconnect() {
    generation += 1
    retry?.cancel()
    retry = nil
    store = nil
    transport = nil
    account = nil
    subscribed = false
    status = "iCloud 账号已变化"
    identityChanged?()
    changed?()
  }
  private func check(_ epoch: Int) throws {
    if epoch != generation { throw SQLiteFailure(message: "iCloud 账号已变化") }
  }
  public func connect(
    container: String, environment: String, name: String, platform: String, bundleID: String,
    transport supplied: (any ChatTransport)? = nil
  ) async {
    let epoch = generation
    do {
      let cloud: any ChatTransport =
        try supplied ?? AppleChatTransport(container: container, environment: environment)
      let key = try await cloud.prepare()
      try check(epoch)
      let file = try SQLiteStore.accountFile(
        root: root, environment: environment, container: container, account: key)
      let store = try SQLiteStore(path: file.path)
      self.store = store
      transport = cloud
      account = key
      subscriptionID = bundleID
      let record = try make(
        "FnChatClient",
        [
          "protocolVersion": 2, "id": store.deviceId, "role": "client", "platform": platform,
          "name": String(name.prefix(80)), "updatedAt": now,
        ], previous: await cloud.read("client:" + store.deviceId))
      try check(epoch)
      let saved = try await cloud.commit([record])
      try check(epoch)
      try store.acknowledge("", records: saved)
      await sync()
    } catch {
      if epoch == generation {
        status = error.localizedDescription
        changed?()
      }
    }
  }
  public var pendingCount: Int { (try? store?.pending().count) ?? 0 }
  public var failures: [String] { (try? store?.failures()) ?? [] }
  public var unsupportedCount: Int { (try? store?.unsupportedCount()) ?? 0 }
  public func records<T: Decodable>(_ type: String, as: T.Type) -> [T] {
    ((try? store?.records(type: type)) ?? []).compactMap {
      try? JSONDecoder().decode(T.self, from: Data($0.payload.utf8))
    }
  }
  public func hosts() -> [ChatHost] {
    records("FnChatHost", as: ChatHost.self).sorted { $0.name < $1.name }
  }
  public func bots() -> [ChatBot] { records("FnChatBot", as: ChatBot.self) }
  public func messages() -> [ChatMessage] {
    (["FnChatUserMessage", "FnChatBotMessage", "FnChatResponse"].flatMap {
      records($0, as: ChatMessage.self)
    }).sorted { $0.createdAt == $1.createdAt ? $0.id < $1.id : $0.createdAt < $1.createdAt }
  }
  public func state(_ id: String) -> RequestState? {
    decodeRecord("state:" + id, as: RequestState.self)
  }
  public func delivery(_ id: String) -> Delivery? {
    decodeRecord("delivery:" + id, as: Delivery.self)
  }
  private func decodeRecord<T: Decodable>(_ id: String, as: T.Type) -> T? {
    guard let r = try? store?.record(id: id) else { return nil }
    return try? JSONDecoder().decode(T.self, from: Data(r.payload.utf8))
  }
  public func failure(_ id: String) -> String? { try? store?.failure(id) }
  public func pending(_ id: String) -> Bool {
    ((try? store?.pending()) ?? []).contains { $0.id == id }
  }
  public func pendingResponse(_ request: String) -> Bool {
    ((try? store?.pending()) ?? []).contains { intent in
      guard intent.kind == "respond", let value = try? object(intent.payload),
        let original = value["request"] as? [String: Any]
      else { return false }
      return original["id"] as? String == request
    }
  }
  public func isRead(_ message: ChatMessage) -> Bool {
    !message.isBot || (try? store?.record(id: "read:" + message.id)) != nil
  }
  public func isArchived(_ id: String) -> Bool {
    guard let r = try? store?.record(id: "archive:" + id), let o = try? object(r.payload) else {
      return false
    }
    return o["archived"] as? Bool == true
      && o["activityDigest"] as? String
        == (try? chatDigest(messages().filter { $0.conversationId == id }.map(\.id)))
  }
  public func localValue(_ key: String) -> String? { try? store?.meta(key) }
  public func setLocalValue(_ key: String, _ value: String) { try? store?.setMeta(key, value) }
  public var now: Int64 { Int64(Date().timeIntervalSince1970 * 1000) }
  private func text(_ value: Any) throws -> String {
    String(
      decoding: try JSONSerialization.data(
        withJSONObject: value, options: [.sortedKeys, .fragmentsAllowed, .withoutEscapingSlashes]),
      as: UTF8.self)
  }
  private func object(_ value: String) throws -> [String: Any] {
    guard let o = try JSONSerialization.jsonObject(with: Data(value.utf8)) as? [String: Any] else {
      throw ChatError.invalidMessage
    }
    return o
  }
  private func make(_ type: String, _ object: [String: Any], previous: ChatRecord? = nil) throws
    -> ChatRecord
  {
    let payload = try text(object)
    let data = Data(payload.utf8)
    try Contract.validate(type: type, data: data)
    return try .init(
      id: Contract.identity(type: type, data: data), type: type, payload: payload,
      systemFields: previous?.systemFields)
  }
  private func botAvailable(_ bot: ChatBot) -> Bool {
    bots().contains { $0.id == bot.id && $0.enabled && $0.version == bot.version }
  }
  public func sendText(_ text: String, to bot: ChatBot) throws -> String {
    guard let store, botAvailable(bot) else { throw SQLiteFailure(message: "机器人不可用") }
    let id = UUID().uuidString
    let record = try make(
      "FnChatUserMessage",
      [
        "protocolVersion": 2, "id": id, "hostId": bot.hostId, "pluginId": bot.pluginId,
        "conversationId": bot.id, "deviceId": store.deviceId, "kind": "userText", "text": text,
        "botVersion": bot.version, "createdAt": now,
      ])
    let payload = String(decoding: try JSONEncoder().encode([record]), as: UTF8.self)
    try store.enqueue(.init(id: id, kind: "create", payload: payload), records: [record])
    changed?()
    Task { await sync() }
    return id
  }
  public func respond(_ request: ChatMessage, action: String, values: [String: JSONValue]) throws {
    guard let store, request.kind == "request", let card = request.supportedCard,
      state(request.id)?.phase == "pending", (request.expiresAt ?? 0) > now,
      !pendingResponse(request.id),
      let bot = bots().first(where: { $0.id == request.conversationId }), botAvailable(bot),
      bot.version == request.botVersion
    else { throw SQLiteFailure(message: "请求已结束、过期或机器人不可用") }
    try card.validate(actionId: action, values: values)
    let id = UUID().uuidString
    let valueObject = try JSONSerialization.jsonObject(with: JSONEncoder().encode(values))
    let response: [String: Any] = [
      "protocolVersion": 2, "id": id, "hostId": request.hostId, "pluginId": request.pluginId,
      "conversationId": request.conversationId, "deviceId": store.deviceId, "kind": "response",
      "requestId": request.id, "actionId": action, "values": valueObject, "botVersion": bot.version,
      "createdAt": now,
    ]
    _ = try make("FnChatResponse", response)
    let original = try JSONSerialization.jsonObject(with: JSONEncoder().encode(request))
    try store.enqueue(
      .init(id: id, kind: "respond", payload: text(["request": original, "message": response])))
    changed?()
    Task { await sync() }
  }
  public func markRead(_ messages: [ChatMessage]) throws {
    for m in messages where m.isBot && !isRead(m) {
      try queue(
        make(
          "FnChatReceipt",
          [
            "protocolVersion": 2, "conversationId": m.conversationId, "messageId": m.id,
            "read": true,
          ]))
    }
  }
  public func archive(_ id: String, archived: Bool) throws {
    try queue(
      make(
        "FnChatArchive",
        [
          "protocolVersion": 2, "conversationId": id, "archived": archived,
          "activityDigest": chatDigest(messages().filter { $0.conversationId == id }.map(\.id)),
        ]))
  }
  private func queue(_ record: ChatRecord) throws {
    guard let store else { throw SQLiteFailure(message: "尚未连接") }
    try store.enqueue(
      .init(
        id: UUID().uuidString, kind: "record",
        payload: String(decoding: JSONEncoder().encode(record), as: UTF8.self)), records: [record])
    changed?()
    Task { await sync() }
  }
  public func sync() async {
    guard let transport, let store, let account else { return }
    if syncing {
      again = true
      return
    }
    syncing = true
    let epoch = generation
    defer {
      syncing = false
      changed?()
      if again {
        again = false
        Task { await self.sync() }
      }
    }
    do {
      guard try await transport.currentAccount() == account else {
        disconnect()
        return
      }
      try check(epoch)
      let before = Set(messages().map(\.id))
      let hadSynced = try store.meta("hasSynced") == "true"
      let lastSync = Int64(try store.meta("lastSync") ?? "0") ?? 0
      try await pull(transport, store, epoch)
      for intent in try store.pending() {
        try check(epoch)
        do { try await submit(intent, transport, store, epoch) } catch let error as CKError
          where error.code == .serverRecordChanged
        { continue } catch let error as SQLiteFailure {
          try check(epoch)
          try store.fail(intent.id, error: error.localizedDescription)
        }
      }
      try await pull(transport, store, epoch)
      try check(epoch)
      if !subscribed, let subscriptionID {
        try await transport.subscribe(subscriptionID)
        try check(epoch)
        subscribed = true
      }
      status = "同步成功"
      try store.setMeta("lastSync", String(now))
      let incoming = messages().filter { $0.isBot && !before.contains($0.id) }
      if hadSynced && lastSync > 0 && now - lastSync > 300_000 && incoming.count > 1 {
        let delivered = await UNUserNotificationCenter.current().deliveredNotifications()
        try check(epoch)
        let ids = Set(
          delivered.compactMap {
            (CKNotification(fromRemoteNotificationDictionary: $0.request.content.userInfo)
              as? CKQueryNotification)?.recordID?.recordName
          })
        if !incoming.contains(where: { ids.contains("message:" + $0.id) }) {
          let content = UNMutableNotificationContent()
          content.title = "fn Chat"
          content.body = "已同步 \(incoming.count) 条机器人新消息"
          content.sound = .default
          content.userInfo = [ChatNotification.messageIDKey: incoming.last!.id]
          try? await UNUserNotificationCenter.current().add(
            .init(identifier: "fn-chat-summary", content: content, trigger: nil))
        }
      }
    } catch {
      guard epoch == generation else { return }
      status = error.localizedDescription
      let delay = max(1, (error as? CKError)?.retryAfterSeconds ?? 60)
      retry?.cancel()
      retry = Task {
        try? await Task.sleep(for: .seconds(delay))
        if !Task.isCancelled { await self.sync() }
      }
    }
  }
  private func pull(_ cloud: any ChatTransport, _ store: SQLiteStore, _ epoch: Int) async throws {
    var token = try store.meta("cursor")
    var reset = false
    var records: [String: ChatRecord] = [:]
    var deleted = Set<String>()
    while true {
      do {
        let page = try await cloud.changes(token)
        try check(epoch)
        for r in page.records {
          records[r.id] = r
          deleted.remove(r.id)
        }
        for id in page.deleted {
          records.removeValue(forKey: id)
          deleted.insert(id)
        }
        token = page.token
        if !page.more { break }
      } catch let error as CKError where error.code == .changeTokenExpired && !reset {
        reset = true
        token = nil
        records.removeAll()
        deleted.removeAll()
      }
    }
    try store.apply(
      Array(records.values), deleted: Array(deleted), token: token ?? "", reset: reset)
  }
  private func submit(
    _ intent: PendingIntent, _ cloud: any ChatTransport, _ store: SQLiteStore, _ epoch: Int
  ) async throws {
    if intent.kind == "create" {
      let records = try JSONDecoder().decode([ChatRecord].self, from: Data(intent.payload.utf8))
      guard let first = records.first else { throw SQLiteFailure(message: "消息不存在") }
      if let existing = try await cloud.read(first.id) {
        try check(epoch)
        guard
          try JSONDecoder().decode(JSONValue.self, from: Data(existing.payload.utf8))
            == JSONDecoder().decode(JSONValue.self, from: Data(first.payload.utf8))
        else { throw SQLiteFailure(message: "消息 ID 冲突") }
        try store.acknowledge(intent.id, records: [existing])
        return
      }
      try check(epoch)
      let saved = try await cloud.commit(records)
      try check(epoch)
      try store.acknowledge(intent.id, records: saved)
      return
    }
    if intent.kind == "record" {
      let r = try JSONDecoder().decode(ChatRecord.self, from: Data(intent.payload.utf8))
      let previous = try await cloud.read(r.id)
      try check(epoch)
      let next = ChatRecord(
        id: r.id, type: r.type, payload: r.payload, systemFields: previous?.systemFields)
      let saved = try await cloud.commit([next])
      try check(epoch)
      try store.acknowledge(intent.id, records: saved)
      return
    }
    let value = try object(intent.payload)
    guard let req = value["request"] as? [String: Any],
      let response = value["message"] as? [String: Any], let id = req["id"] as? String
    else { throw SQLiteFailure(message: "回复格式无效") }
    guard let original = try await cloud.read("message:" + id),
      let sr = try await cloud.read("state:" + id)
    else { throw SQLiteFailure(message: "请求不存在") }
    try check(epoch)
    let request = try JSONDecoder().decode(ChatMessage.self, from: Data(original.payload.utf8))
    let expected = try JSONDecoder().decode(ChatMessage.self, from: Data(text(req).utf8))
    let state = try JSONDecoder().decode(RequestState.self, from: Data(sr.payload.utf8))
    guard request == expected else { throw SQLiteFailure(message: "请求内容已变化") }
    if state.responseId == intent.id {
      guard let reply = try await cloud.read("message:" + intent.id) else {
        throw SQLiteFailure(message: "回复状态不完整")
      }
      try check(epoch)
      try store.acknowledge(intent.id, records: [sr, reply])
      return
    }
    guard state.phase == "pending", (request.expiresAt ?? 0) > now, let card = request.supportedCard
    else { throw SQLiteFailure(message: "请求已处理或过期") }
    guard let br = try await cloud.read("bot:" + request.hostId + ":" + request.pluginId) else {
      throw SQLiteFailure(message: "机器人不存在")
    }
    try check(epoch)
    let bot = try JSONDecoder().decode(ChatBot.self, from: Data(br.payload.utf8))
    guard bot.enabled, bot.version == request.botVersion else {
      throw SQLiteFailure(message: "机器人已停用或版本变化")
    }
    let m = try JSONDecoder().decode(ChatMessage.self, from: Data(text(response).utf8))
    guard m.requestId == request.id, m.conversationId == request.conversationId,
      m.botVersion == request.botVersion, let action = m.actionId, let values = m.values
    else { throw SQLiteFailure(message: "回复归属无效") }
    try card.validate(actionId: action, values: values)
    var next = try object(sr.payload)
    next["phase"] = "responded"
    next["responseId"] = intent.id
    next["revision"] = state.revision + 1
    next["updatedAt"] = now
    let records = try [
      make("FnChatResponse", response), make("FnChatRequestState", next, previous: sr),
    ]
    try check(epoch)
    let saved = try await cloud.commit(records)
    try check(epoch)
    try store.acknowledge(intent.id, records: saved)
  }
}
