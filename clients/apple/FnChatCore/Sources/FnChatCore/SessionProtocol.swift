import Foundation

/// fn display DTOs are independent of dsh runtime and persistence objects.
public struct SessionHost: Codable, Identifiable, Sendable { public let id, hostId, name: String }
public struct SessionEndpoint: Codable, Identifiable, Sendable {
  public let id, hostId, appId, endpointId, name: String
  public let enabled: Bool
}
public struct SessionConnection: Codable, Identifiable, Sendable {
  public struct Model: Codable, Identifiable, Hashable, Sendable { public let id, name: String }
  public let id, hostId, name: String
  public let enabled: Bool
  public let models: [Model]
}
public struct SessionInfo: Codable, Identifiable, Sendable {
  public let id, appId, connectionId, modelId, title, policy, status: String
  public let endpointId: String?
  public let createdAt, updatedAt: Int64
  public let archived: Bool
}
public struct SessionSummary: Codable, Identifiable, Sendable {
  public struct Approval: Codable, Identifiable, Sendable { public let id, toolName: String; public let reason: String? }
  public let id, hostId: String
  public let session: SessionInfo
  public let readSeq: Int?
  public let asOfSeq: Int
  public let approvals: [Approval]
}
public struct SessionDisplayItem: Codable, Identifiable, Sendable {
  public let id, kind, text: String
  public let seq: Int
  public let createdAt: Int64
  public let reasoning, toolName, callId, state: String?
  public let truncated: Bool
}
public struct SessionItemRecord: Codable, Identifiable, Sendable {
  public let id, hostId, sessionId: String
  public let item: SessionDisplayItem
}
public struct SessionCommandResult: Codable, Identifiable, Sendable {
  public let id, hostId, status: String
  public let sessionId, error: String?
}
public struct SessionCard: Codable, Identifiable, Sendable {
  public struct Answer: Codable, Sendable { public let actionId: String; public let values: [String: JSONValue] }
  public let id, sessionId, state: String
  public let createdAt, expiresAt: Int64
  public let card: ChatCard
  public let answer: Answer?
  public let error: String?
}
public struct SessionCardRecord: Codable, Identifiable, Sendable {
  public let id, hostId, sessionId: String
  public let card: SessionCard
}
public enum SessionContract {
  private static let schemas: JSONValue = {
    try! JSONDecoder().decode(JSONValue.self, from: Data(contentsOf:
      Bundle.module.url(forResource: "session-contracts", withExtension: "json")!))
  }()
  public static func validate(type: String, data: Data) throws {
    guard data.count <= 192 * 1024 else { throw ChatError.oversized }
    let value = try JSONDecoder().decode(JSONValue.self, from: data)
    guard let object = value.object, object["protocolVersion"] == .number(3) else {
      throw ChatError.unsupportedVersion
    }
    guard let schema = schemas.object?[type] else { throw ChatError.unknownType }
    try Contract.validate(value, schema: schema, root: schema)
    if type == "FnSessionCard" {
      let record = try JSONDecoder().decode(SessionCardRecord.self, from: data)
      guard record.card.id == record.id, record.card.sessionId == record.sessionId else { throw ChatError.invalidMessage }
      try record.card.card.validateSessionDefinition()
    }
    if type == "FnSessionCommand", object["action"] == .string("send") {
      guard let text = object["text"]?.string,
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { throw ChatError.invalidMessage }
    }
  }
  public static func identity(type: String, data: Data) throws -> String {
    try validate(type: type, data: data)
    let value = try JSONDecoder().decode(JSONValue.self, from: data)
    guard let id = value.object?["id"]?.string, let host = value.object?["hostId"]?.string else {
      throw ChatError.invalidMessage
    }
    return type + ":" + host + ":" + id
  }
}

extension ChatCard {
  func validateSessionDefinition() throws {
    guard Set(inputs.map(\.id)).count == inputs.count, Set(actions.map(\.id)).count == actions.count else { throw ChatError.invalidMessage }
    for field in inputs {
      guard ["select", "multiSelect"].contains(field.type) == (field.options != nil),
        field.options.map({ Set($0.map(\.id)).count == $0.count }) ?? true,
        field.maxLength == nil || field.type == "text",
        (field.minimum == nil && field.maximum == nil) || field.type == "number"
      else { throw ChatError.invalidMessage }
      if let min = field.minimum, let max = field.maximum, min > max { throw ChatError.invalidMessage }
    }
  }
}
