import CloudKit
import FIACloudKit
import Foundation

public struct ChatChanges: Sendable {
  public let records: [ChatRecord]
  public let deleted: [String]
  public let token: String
  public let more: Bool
}
@MainActor public protocol ChatTransport {
  func prepare() async throws -> String
  func currentAccount() async throws -> String
  func read(_ id: String) async throws -> ChatRecord?
  func commit(_ records: [ChatRecord]) async throws -> [ChatRecord]
  func changes(_ token: String?) async throws -> ChatChanges
  func subscribe(_ id: String) async throws
}
