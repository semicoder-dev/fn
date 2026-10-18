import CloudKit
import Foundation
import Testing

@testable import FnChatCore

private struct Fixture: Decodable {
  struct Item: Decodable {
    let type: String
    let value: JSONValue
  }
  let records: [Item]
  let invalid: [Item]
  let values: [String: JSONValue]
}
private func fixture() throws -> Fixture {
  var root = URL(fileURLWithPath: #filePath)
  for _ in 0..<6 { root.deleteLastPathComponent() }
  return try JSONDecoder().decode(
    Fixture.self, from: Data(contentsOf: root.appending(path: "chat/fixtures/v2.json")))
}
private func encoded(_ value: JSONValue) throws -> Data { try JSONEncoder().encode(value) }
@Test func summaryNotificationRetainsConversationTarget() {
  #expect(
    ChatNotification.messageID(from: [ChatNotification.messageIDKey: "bot-message"])
      == "bot-message")
  #expect(ChatNotification.messageID(from: [:]) == nil)
  #expect(ChatNotification.messageID(from: [ChatNotification.messageIDKey: ""]) == nil)
}
@Test func sharedProtocolAndCards() throws {
  let f = try fixture()
  for r in f.records { try Contract.validate(type: r.type, data: encoded(r.value)) }
  for r in f.invalid {
    #expect(throws: (any Error).self) {
      try Contract.validate(type: r.type, data: encoded(r.value))
    }
  }
  let r = try #require(f.records.first { $0.value.object?["kind"] == .string("request") })
  let message = try JSONDecoder().decode(ChatMessage.self, from: encoded(r.value))
  let card = try #require(message.supportedCard)
  try card.validate(actionId: "submit", values: f.values)
  var values = f.values
  values["choices"] = .array([.string("a"), .string("a")])
  #expect(throws: (any Error).self) { try card.validate(actionId: "submit", values: values) }
  values = f.values
  values["count"] = .number(6)
  #expect(throws: (any Error).self) { try card.validate(actionId: "submit", values: values) }
  var object = try #require(r.value.object)
  var unknown = try #require(object["card"]?.object)
  unknown["version"] = .number(999)
  object["card"] = .object(unknown)
  let data = try encoded(.object(object))
  try Contract.validate(type: r.type, data: data)
  #expect(try JSONDecoder().decode(ChatMessage.self, from: data).supportedCard == nil)
  var oversized = try #require(f.records.first { $0.type == "FnChatUserMessage" }?.value.object)
  oversized["text"] = .string(String(repeating: "文", count: 23_000))
  #expect(throws: (any Error).self) {
    try Contract.validate(type: "FnChatUserMessage", data: encoded(.object(oversized)))
  }
}
@Test @MainActor func sqliteCursorRebuildAndAccountIsolation() throws {
  let store = try SQLiteStore(path: ":memory:")
  let item = try #require(fixture().records.first { $0.type == "FnChatUserMessage" })
  let data = try encoded(item.value)
  let record = try ChatRecord(
    id: Contract.identity(type: item.type, data: data), type: item.type,
    payload: String(decoding: data, as: UTF8.self))
  try store.enqueue(.init(id: "outbox", kind: "create", payload: "[]"), records: [record])
  try store.apply([], deleted: [], token: "reset", reset: true)
  #expect(try store.record(id: record.id) != nil)
  #expect(try store.pending().count == 1)
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let a = try SQLiteStore.accountFile(
    root: root, environment: "development", container: "iCloud.test.development", account: "a")
  let b = try SQLiteStore.accountFile(
    root: root, environment: "development", container: "iCloud.test.development", account: "b")
  #expect(a != b)
  #expect(a.path.contains("chat-v2"))
}
@MainActor private final class FakeCloud: ChatTransport {
  var account = "account-a", revision = 0, offline = false, expire = false
  var records: [String: ChatRecord] = [:]
  func prepare() async throws -> String { account }
  func currentAccount() async throws -> String { account }
  func subscribe(_ id: String) async throws {}
  func read(_ id: String) async throws -> ChatRecord? { records[id] }
  func commit(_ values: [ChatRecord]) async throws -> [ChatRecord] {
    if offline { throw CKError(.networkUnavailable) }
    for r in values {
      if records[r.id]?.systemFields != r.systemFields { throw CKError(.serverRecordChanged) }
    }
    let saved = values.map { r in
      revision += 1
      return ChatRecord(
        id: r.id, type: r.type, payload: r.payload, systemFields: Data(String(revision).utf8))
    }
    for r in saved { records[r.id] = r }
    return saved
  }
  func changes(_ token: String?) async throws -> ChatChanges {
    if expire && token != nil {
      expire = false
      throw CKError(.changeTokenExpired)
    }
    return .init(records: Array(records.values), deleted: [], token: String(revision), more: false)
  }
  func seed() async throws {
    for r in try fixture().records where r.type != "FnChatResponse" {
      var value = r.value
      if value.object?["kind"] == .string("request") {
        var object = value.object!
        object["expiresAt"] = .number(floor(Date().timeIntervalSince1970 * 1000) + 600_000)
        value = .object(object)
      }
      let data = try encoded(value)
      _ = try await commit([
        ChatRecord(
          id: Contract.identity(type: r.type, data: data), type: r.type,
          payload: String(decoding: data, as: UTF8.self))
      ])
    }
  }
}
@Test @MainActor func twoClientsShareHistoryAndFirstCardReplyWins() async throws {
  let cloud = FakeCloud()
  try await cloud.seed()
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let a = ChatSync(root: root.appending(path: "a"))
  let b = ChatSync(root: root.appending(path: "b"))
  await a.connect(
    container: "iCloud.test.development", environment: "development", name: "Phone",
    platform: "iOS", bundleID: "test.a", transport: cloud)
  await b.connect(
    container: "iCloud.test.development", environment: "development", name: "Mac",
    platform: "macOS", bundleID: "test.b", transport: cloud)
  #expect(a.messages().count == 3)
  #expect(b.hosts().count == 1)
  let req = try #require(a.messages().first { $0.kind == "request" })
  let values = try fixture().values
  try a.respond(req, action: "submit", values: values)
  try b.respond(req, action: "submit", values: values)
  await a.sync()
  await b.sync()
  await a.sync()
  await b.sync()
  #expect(cloud.records.values.filter { $0.type == "FnChatResponse" }.count == 1)
  #expect(a.state(req.id)?.phase == "responded")
  #expect(b.state(req.id)?.phase == "responded")
  try a.markRead(a.messages())
  await a.sync()
  await b.sync()
  #expect(b.messages().filter(\.isBot).allSatisfy { b.isRead($0) })
  try a.archive(req.conversationId, archived: true)
  await a.sync()
  await b.sync()
  #expect(b.isArchived(req.conversationId))
  try b.archive(req.conversationId, archived: false)
  await b.sync()
  await a.sync()
  #expect(!a.isArchived(req.conversationId))
  a.disconnect()
  b.disconnect()
}
@Test @MainActor func offlineSendCursorExpiryAndAccountChange() async throws {
  let cloud = FakeCloud()
  try await cloud.seed()
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let sync = ChatSync(root: root)
  await sync.connect(
    container: "iCloud.test.development", environment: "development", name: "Mac",
    platform: "macOS", bundleID: "test.client", transport: cloud)
  let bot = try #require(sync.bots().first)
  cloud.offline = true
  let id = try sync.sendText("离线文字", to: bot)
  await sync.sync()
  #expect(sync.pending(id))
  #expect(cloud.records["message:" + id] == nil)
  cloud.offline = false
  cloud.expire = true
  await sync.sync()
  #expect(cloud.records["message:" + id] != nil)
  #expect(!sync.pending(id))
  let record = try #require(
    cloud.records.values.first { $0.type == "FnChatClient" && $0.id != "client:phone-a" })
  #expect(record.payload.contains("macOS"))
  #expect(!record.payload.contains("\"role\":\"host\""))
  cloud.account = "account-b"
  await sync.sync()
  #expect(sync.store == nil)
  sync.disconnect()
}
