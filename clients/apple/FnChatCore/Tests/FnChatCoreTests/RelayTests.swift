import Foundation
import Testing

@testable import FnChatCore

@MainActor final class MemoryTransport: RelayTransport {
  var account = "account-a"
  var records: [String: RelayRecord] = [:]
  var loseAcknowledgement = false
  func accountKey() async throws -> String { account }
  func prepare() async throws {}
  func changes(_ token: Data?) async throws -> RelayChanges {
    RelayChanges(records: Array(records.values), deleted: [], token: Data([1]), more: false)
  }
  func send(_ record: RelayRecord) async throws -> RelayRecord {
    if let previous = records[record.id] { #expect(previous.payload == record.payload) }
    records[record.id] = record
    if loseAcknowledgement {
      loseAcknowledgement = false
      throw RelayError.invalidMessage
    }
    return record
  }
}
@Test @MainActor func persistsQueueAndStableRetry() async throws {
  let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = MemoryTransport()
  let sync = PhoneSync(root: root)
  try await sync.connect(container: "test", transport: transport)
  let request = try #require(sync.store).enqueue(
    hostId: "desktop", instanceId: "translate", text: "Hello", locale: "en")
  transport.loseAcknowledgement = true
  await sync.sync()
  #expect(sync.store?.document.outbox.count == 1)
  #expect(transport.records.count == 1)
  sync.disconnect()
  try await sync.connect(container: "test", transport: transport)
  #expect(sync.store?.document.outbox.isEmpty == true)
  #expect(transport.records.count == 1)
  #expect(sync.store?.document.requests.first?.id == request.id)
  let next = try #require(sync.store).enqueue(
    hostId: "desktop", instanceId: "translate", text: "Next", locale: "en")
  #expect(next.id != request.id)
  #expect(next.conversationId == request.conversationId)
}
@Test @MainActor func accountDataRemainsIsolated() async throws {
  let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let transport = MemoryTransport()
  let sync = PhoneSync(root: root)
  try await sync.connect(container: "test", transport: transport)
  _ = try sync.store?.enqueue(
    hostId: "desktop", instanceId: "translate", text: "Private", locale: "en")
  transport.account = "account-b"
  await sync.sync()
  #expect(sync.store == nil)
  try await sync.connect(container: "test", transport: transport)
  #expect(sync.store?.document.requests.isEmpty == true)
  transport.account = "account-a"
  sync.disconnect()
  try await sync.connect(container: "test", transport: transport)
  #expect(sync.store?.document.requests.count == 1)
}
@Test @MainActor func repliesWaitForAllChunksAndSurviveReorderedDelivery() throws {
  let root = FileManager.default.temporaryDirectory.appending(path: UUID().uuidString)
  defer { try? FileManager.default.removeItem(at: root) }
  let store = try PhoneStore(file: root.appending(path: "messages.json"))
  let request = try store.enqueue(
    hostId: "desktop", instanceId: "translate", text: "Hello", locale: "en")
  let status = RelayStatus(
    id: request.id, hostId: "desktop", instanceId: "translate",
    conversationId: request.conversationId, text: "", locale: "en", createdAt: request.createdAt,
    status: "completed", replyParts: 2)
  func record<T: Encodable>(_ id: String, _ type: String, _ payload: T) throws -> RelayRecord {
    RelayRecord(
      id: id, type: type,
      payload: String(decoding: try JSONEncoder().encode(payload), as: UTF8.self))
  }
  let second = try record(
    "reply-" + request.id + "-1", "FnRelayReply",
    RelayReply(messageId: request.id, hostId: "desktop", index: 1, text: "世界😀"))
  try store.merge(
    RelayChanges(
      records: [try record("status-" + request.id, "FnRelayStatus", status), second], deleted: [],
      more: false))
  #expect(store.messages(hostId: "desktop", instanceId: "translate").first?.status == "processing")
  let first = try record(
    "reply-" + request.id + "-0", "FnRelayReply",
    RelayReply(messageId: request.id, hostId: "desktop", index: 0, text: "你好，"))
  try store.merge(RelayChanges(records: [first, second], deleted: [], more: false))
  let reopened = try PhoneStore(file: root.appending(path: "messages.json"))
  let message = try #require(reopened.messages(hostId: "desktop", instanceId: "translate").first)
  #expect(message.status == "completed")
  #expect(message.reply == "你好，世界😀")
  #expect(message.text == "Hello")
}
