import CloudKit
import FIACloudKit
import Foundation

@MainActor public final class SessionAppleTransport: ChatTransport {
  private let cloud: CloudKitTransport
  private let zone: CKRecordZone.ID
  private var account: String?
  public init(container: String, environment: String) throws {
    guard ["development", "preview", "production"].contains(environment),
      container.hasPrefix("iCloud."),
      container.hasSuffix(environment == "production" ? ".production" : ".development")
    else { throw SQLiteFailure(message: "聊天容器与环境不匹配") }
    cloud = CloudKitTransport(containerIdentifier: container)
    zone = .init(zoneName: "fn-chat-" + environment + "-v3")
  }
  public func currentAccount() async throws -> String { try await cloud.accountKey() }
  public func prepare() async throws -> String {
    let key = try await currentAccount()
    _ = try await cloud.ensureZone(zone.zoneName)
    guard try await currentAccount() == key else { throw SQLiteFailure(message: "iCloud 账号已变化") }
    account = key
    return key
  }
  private func check() async throws {
    guard let account, try await currentAccount() == account else {
      throw SQLiteFailure(message: "iCloud 账号已变化")
    }
  }
  private func local(_ r: CKRecord) throws -> ChatRecord {
    guard let payload = r["payload"] as? String else { throw ChatError.invalidMessage }
    let archiver = NSKeyedArchiver(requiringSecureCoding: true)
    r.encodeSystemFields(with: archiver)
    archiver.finishEncoding()
    return .init(
      id: r.recordID.recordName, type: r.recordType, payload: payload,
      systemFields: archiver.encodedData)
  }
  private func remote(_ r: ChatRecord) throws -> CKRecord {
    try SessionContract.validate(type: r.type, data: Data(r.payload.utf8))
    let record: CKRecord
    if let fields = r.systemFields {
      let decoder = try NSKeyedUnarchiver(forReadingFrom: fields)
      decoder.requiresSecureCoding = true
      defer { decoder.finishDecoding() }
      guard let previous = CKRecord(coder: decoder), previous.recordID.recordName == r.id,
        previous.recordID.zoneID == zone, previous.recordType == r.type
      else { throw ChatError.invalidMessage }
      record = previous
    } else {
      record = CKRecord(recordType: r.type, recordID: .init(recordName: r.id, zoneID: zone))
    }
    record["payload"] = r.payload as CKRecordValue
    return record
  }
  public func read(_ id: String) async throws -> ChatRecord? {
    try await check()
    do { return try local(await cloud.record(.init(recordName: id, zoneID: zone))) } catch let error
      as CKError where error.code == .unknownItem
    { return nil }
  }
  public func commit(_ records: [ChatRecord]) async throws -> [ChatRecord] {
    try await check()
    return try await cloud.commit(saving: records.map(remote)).map(local)
  }
  public func changes(_ token: String?) async throws -> ChatChanges {
    try await check()
    let decoded = try CloudKitTransport.decodeToken(token.flatMap { Data(base64Encoded: $0) })
    let page = try await cloud.changes(zoneID: zone, since: decoded)
    return try .init(
      records: page.records.map(local), deleted: page.deletedIDs.map(\.recordName),
      token: CloudKitTransport.encodeToken(page.token).base64EncodedString(), more: page.moreComing)
  }
  public func subscribe(_ id: String) async throws {
    try await check()
    try await cloud.removeSubscription(id: "fn-messages-" + id)
    try await cloud.subscribeToZone(id: "fn-chat-v3-sync-" + id + "-" + zone.zoneName, zoneID: zone)
    try await cloud.subscribeToCreations(id: "fn-chat-v3-cards-" + id + "-" + zone.zoneName, recordType: "FnSessionCard", zoneID: zone, title: "fn Chat", body: "会话有应用卡片，请打开查看。")
    try await cloud.subscribeToCreations(
      id: "fn-chat-v3-bots-" + id + "-" + zone.zoneName, recordType: "FnSessionReply",
      zoneID: zone, title: "fn Chat", body: "会话有新内容，请打开查看。")
  }
}
