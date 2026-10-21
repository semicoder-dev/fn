import CloudKit
import Foundation
import Testing
@testable import FnChatCore

private func sessionRecord(_ type: String, _ object: [String: Any]) throws -> ChatRecord {
  let data = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
  return try ChatRecord(id: SessionContract.identity(type: type, data: data), type: type, payload: String(decoding: data, as: UTF8.self))
}
@MainActor private final class SessionMemoryTransport: ChatTransport {
  var account = "a"
  var records: [String: ChatRecord] = [:]
  var online = true
  var expire = false
  var commits = 0
  func currentAccount() async throws -> String { account }
  func prepare() async throws -> String { account }
  func subscribe(_ id: String) async throws {}
  func read(_ id: String) async throws -> ChatRecord? {
    if !online { throw SQLiteFailure(message: "offline") }
    return records[id]
  }
  func commit(_ value: [ChatRecord]) async throws -> [ChatRecord] {
    if !online { throw SQLiteFailure(message: "offline") }
    commits += value.count
    for record in value { records[record.id] = record }
    return value
  }
  func changes(_ token: String?) async throws -> ChatChanges {
    if !online { throw SQLiteFailure(message: "offline") }
    if expire && token != nil { expire = false; throw CKError(.changeTokenExpired) }
    return .init(records: Array(records.values), deleted: [], token: "cursor", more: false)
  }
}
@Test func sessionProtocolRejectsLegacyAndKeepsDisplayDTOsIndependent() throws {
  let host = try sessionRecord("FnSessionHost", ["protocolVersion": 3, "id": "h", "hostId": "h", "name": "Mac", "updatedAt": 1])
  #expect(host.id == "FnSessionHost:h:h")
  #expect(throws: (any Error).self) {
    try sessionRecord("FnSessionHost", ["protocolVersion": 2, "id": "h", "hostId": "h", "name": "Mac", "updatedAt": 1])
  }
  #expect(throws: (any Error).self) {
    try sessionRecord("FnSessionCommand", ["protocolVersion": 3, "id": "x", "hostId": "h", "deviceId": "p", "createdAt": 1, "action": "send", "sessionId": "s", "text": " "])
  }
  let reply = try sessionRecord("FnSessionReply", ["protocolVersion": 3, "id": "s:1", "hostId": "h", "sessionId": "s",
    "item": ["id": "s:1", "seq": 1, "createdAt": 1, "kind": "assistant", "text": "hello", "truncated": false]])
  let decoded = try JSONDecoder().decode(SessionItemRecord.self, from: Data(reply.payload.utf8))
  #expect(decoded.item.text == "hello")
}
@Test @MainActor func sessionOfflineQueueRetriesOnceAndAccountChangeClearsState() async throws {
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = SessionMemoryTransport()
  let sync = SessionSync(root: root)
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  transport.online = false
  let id = try sync.enqueue(host: "host", action: "send", fields: ["sessionId": "s", "text": "hello"])
  await sync.sync()
  #expect(sync.pendingCount == 1)
  transport.online = true
  await sync.sync()
  #expect(sync.pendingCount == 0)
  #expect(transport.commits == 1)
  await sync.sync()
  #expect(transport.commits == 1)
  #expect(transport.records["FnSessionCommand:host:" + id] != nil)
  transport.account = "b"
  await sync.sync()
  #expect(sync.store == nil)
  #expect(sync.hosts().isEmpty)
}
@Test @MainActor func sessionCursorResetPreservesQueuedCommandsAndAccountsUseNewNamespace() async throws {
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let path = try SessionSQLiteStore.accountFile(root: root, environment: "development", container: "iCloud.test.development", account: "a")
  let other = try SessionSQLiteStore.accountFile(root: root, environment: "development", container: "iCloud.test.development", account: "b")
  #expect(path != other)
  #expect(path.path.contains("chat-v3"))
  let store = try SessionSQLiteStore(path: path.path)
  let command = try sessionRecord("FnSessionCommand", ["protocolVersion": 3, "id": "q", "hostId": "h", "deviceId": "p", "createdAt": 1, "action": "cancel", "sessionId": "s"])
  try store.enqueue(.init(id: "q", kind: "command", payload: "command"), records: [command])
  try store.apply([], deleted: [], token: "fresh", reset: true)
  #expect(try store.record(id: command.id) == command)
  #expect(try store.pending().count == 1)
  #expect(try store.meta("cursor") == "fresh")
}

@Test @MainActor func readReceiptsSurviveOfflineRestartAndRemoteReceiptsClearUnread() async throws {
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = SessionMemoryTransport()
  let reply = try sessionRecord("FnSessionReply", ["protocolVersion": 3, "id": "s:1", "hostId": "h", "sessionId": "s",
    "item": ["id": "s:1", "seq": 1, "createdAt": 1, "kind": "assistant", "text": "hello", "truncated": false]])
  transport.records[reply.id] = reply
  let sync = SessionSync(root: root)
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  #expect(sync.unreadCount(host: "h", session: "s") == 1)
  transport.online = false
  try sync.markRead(host: "h", session: "s")
  try sync.markRead(host: "h", session: "s")
  await sync.sync()
  #expect(sync.pendingCount == 1)
  #expect(sync.unreadCount(host: "h", session: "s") == 0)
  sync.disconnect()
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  #expect(sync.unreadCount(host: "h", session: "s") == 0)
  #expect(sync.pendingCount == 1)
  transport.online = true
  await sync.sync()
  #expect(sync.pendingCount == 0)
  #expect(transport.commits == 1)
  let other = SessionSync(root: root.appending(path: "other-device"))
  let summary = try sessionRecord("FnSessionSummary", ["protocolVersion": 3, "id": "s", "hostId": "h", "asOfSeq": 1, "readSeq": 1, "approvals": [],
    "session": ["id": "s", "appId": "app", "connectionId": "c", "modelId": "m", "title": "Session", "createdAt": 1, "updatedAt": 1, "archived": false, "policy": "controlled", "status": "idle"]])
  transport.records[summary.id] = summary
  await other.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  #expect(other.unreadCount(host: "h", session: "s") == 0)
  #expect(other.readSequence(host: "different-host", session: "s") == -1)
  transport.account = "b"
  await other.sync()
  #expect(other.store == nil)
}

private func cardObject(state: String = "pending") -> [String: Any] {
  var card: [String: Any] = ["id": "card", "sessionId": "s", "state": state, "createdAt": 1,
    "expiresAt": Int64(Date().timeIntervalSince1970 * 1000) + 60000,
    "card": ["version": 1, "template": "form", "title": "Review", "summary": "", "blocks": [],
      "inputs": [["id": "text", "label": "Text", "type": "text", "required": true, "maxLength": 5],
        ["id": "number", "label": "Number", "type": "number", "required": true, "minimum": 1, "maximum": 3],
        ["id": "flag", "label": "Flag", "type": "boolean", "required": true],
        ["id": "choice", "label": "Choice", "type": "select", "required": true, "options": [["id": "a", "label": "A"]]],
        ["id": "multi", "label": "Multi", "type": "multiSelect", "required": false, "options": [["id": "a", "label": "A"]]]],
      "actions": [["id": "ok", "label": "OK"]]]]
  if state == "completed" { card["answer"] = ["actionId": "ok", "values": ["text": "hello", "number": 2, "flag": false, "choice": "a"]] }
  return ["protocolVersion": 3, "id": "card", "hostId": "h", "sessionId": "s", "card": card]
}
@Test func sessionCardsValidateIdentityDefinitionAndAllFieldTypes() throws {
  let record = try sessionRecord("FnSessionCard", cardObject())
  let decoded = try JSONDecoder().decode(SessionCardRecord.self, from: Data(record.payload.utf8))
  let values: [String: JSONValue] = ["text": .string("hello"), "number": .number(2), "flag": .bool(false), "choice": .string("a"), "multi": .array([.string("a")])]
  try decoded.card.card.validate(actionId: "ok", values: values)
  for (key, value) in [("text", JSONValue.string("too long")), ("number", .number(4)), ("flag", .string("false")), ("choice", .string("missing")), ("multi", .array([.string("a"), .string("a")])), ("unknown", .bool(true))] {
    var invalid = values; invalid[key] = value
    #expect(throws: (any Error).self) { try decoded.card.card.validate(actionId: "ok", values: invalid) }
  }
  var wrong = cardObject(); wrong["sessionId"] = "other"
  #expect(throws: (any Error).self) { try sessionRecord("FnSessionCard", wrong) }
  var envelope = cardObject(), card = envelope["card"] as! [String: Any], definition = card["card"] as! [String: Any]
  definition["actions"] = [["id": "ok", "label": "One"], ["id": "ok", "label": "Duplicate"]]
  card["card"] = definition; envelope["card"] = card
  #expect(throws: (any Error).self) { try sessionRecord("FnSessionCard", envelope) }
}
@Test @MainActor func cardReplySurvivesOfflineRestartAndCompletedAnswerReachesOtherDevice() async throws {
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = SessionMemoryTransport()
  let records = [try sessionRecord("FnSessionCard", cardObject()),
    try sessionRecord("FnSessionEndpoint", ["protocolVersion": 3, "id": "endpoint", "hostId": "h", "appId": "app", "endpointId": "chat", "name": "Chat", "enabled": true]),
    try sessionRecord("FnSessionSummary", ["protocolVersion": 3, "id": "s", "hostId": "h", "asOfSeq": -1, "readSeq": -1, "approvals": [],
      "session": ["id": "s", "appId": "app", "endpointId": "chat", "connectionId": "c", "modelId": "m", "title": "Session", "createdAt": 1, "updatedAt": 1, "archived": false, "policy": "controlled", "status": "idle"]])]
  for record in records { transport.records[record.id] = record }
  let sync = SessionSync(root: root)
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  let card = try #require(sync.cards(host: "h", session: "s").first)
  #expect(sync.cardAvailable(card))
  transport.online = false
  let values: [String: JSONValue] = ["text": .string("hello"), "number": .number(2), "flag": .bool(false), "choice": .string("a")]
  try sync.respondCard(card, action: "ok", values: values)
  #expect(throws: (any Error).self) { try sync.respondCard(card, action: "ok", values: values) }
  await sync.sync(); #expect(sync.pendingCount == 1); #expect(!sync.cardAvailable(card))
  sync.disconnect()
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  #expect(sync.pendingCount == 1); #expect(sync.pendingCard(host: "h", id: "card"))
  transport.online = true
  await sync.sync(); await sync.sync()
  #expect(transport.commits == 1); #expect(sync.pendingCount == 0)
  #expect(!sync.cardAvailable(card)) // A transport receipt is not a host result.
  let command = try #require(transport.records.values.first { $0.type == "FnSessionCommand" })
  let commandJSON = try #require(try JSONSerialization.jsonObject(with: Data(command.payload.utf8)) as? [String: Any])
  let result = try sessionRecord("FnSessionResult", ["protocolVersion": 3, "hostId": "h", "id": commandJSON["id"]!, "sessionId": "s", "status": "completed", "updatedAt": 2])
  transport.records[result.id] = result
  let completed = try sessionRecord("FnSessionCard", cardObject(state: "completed"))
  transport.records[completed.id] = completed
  await sync.sync()
  #expect(!sync.pendingCard(host: "h", id: "card"))
  let other = SessionSync(root: root.appending(path: "other"))
  await other.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  let accepted = try #require(other.cards(host: "h", session: "s").first)
  #expect(accepted.card.answer?.values == values); #expect(!other.cardAvailable(accepted))
  transport.account = "different"; await other.sync()
  #expect(other.cards(host: "h", session: "s").isEmpty)
}
@Test @MainActor func phoneHidesEmptyDisabledAndOtherHostModelConnections() async throws {
  let root = URL.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = SessionMemoryTransport()
  for (id, host, enabled, models) in [("selected", "h", true, [["id": "m", "name": "Selected"]]), ("empty", "h", true, []), ("disabled", "h", false, [["id": "m", "name": "Unavailable"]]), ("other", "other-host", true, [["id": "m", "name": "Other"]])] {
    let record = try sessionRecord("FnSessionConnection", ["protocolVersion": 3, "id": id, "hostId": host, "name": id, "enabled": enabled, "models": models])
    transport.records[record.id] = record
  }
  let sync = SessionSync(root: root)
  await sync.connect(container: "iCloud.test.development", environment: "development", bundleID: "test", transport: transport)
  #expect(sync.connections(host: "h").map(\.id) == ["selected"])
  let empty = try sessionRecord("FnSessionConnection", ["protocolVersion": 3, "id": "selected", "hostId": "h", "name": "Selected", "enabled": false, "models": []])
  transport.records[empty.id] = empty; await sync.sync()
  #expect(sync.connections(host: "h").isEmpty)
}
