import CSQLite
import CryptoKit
import Foundation

public struct ChatRecord: Codable, Sendable, Equatable {
  public let id: String
  public let type: String
  public let payload: String
  public let systemFields: Data?
  public init(id: String, type: String, payload: String, systemFields: Data? = nil) {
    self.id = id
    self.type = type
    self.payload = payload
    self.systemFields = systemFields
  }
}
public struct PendingIntent: Codable, Sendable {
  public let id: String
  public let kind: String
  public let payload: String
}
public struct SQLiteFailure: Error, LocalizedError {
  public let message: String
  public init(message: String) { self.message = message }
  public var errorDescription: String? { message }
}
