import CryptoKit
import Foundation

public enum JSONValue: Codable, Equatable, Sendable {
  case null
  case bool(Bool)
  case number(Double)
  case string(String)
  case array([JSONValue])
  case object([String: JSONValue])
  public init(from decoder: any Decoder) throws {
    let value = try decoder.singleValueContainer()
    if value.decodeNil() {
      self = .null
    } else if let data = try? value.decode(Bool.self) {
      self = .bool(data)
    } else if let data = try? value.decode(Double.self) {
      self = .number(data)
    } else if let data = try? value.decode(String.self) {
      self = .string(data)
    } else if let data = try? value.decode([JSONValue].self) {
      self = .array(data)
    } else {
      self = .object(try value.decode([String: JSONValue].self))
    }
  }
  public func encode(to encoder: any Encoder) throws {
    var value = encoder.singleValueContainer()
    switch self {
    case .null: try value.encodeNil()
    case .bool(let data): try value.encode(data)
    case .number(let data): try value.encode(data)
    case .string(let data): try value.encode(data)
    case .array(let data): try value.encode(data)
    case .object(let data): try value.encode(data)
    }
  }
}
public enum ChatError: Error, LocalizedError {
  case unsupportedVersion, invalidMessage, oversized, unknownType
  public var errorDescription: String? {
    switch self {
    case .unsupportedVersion: "聊天协议版本不支持"
    case .invalidMessage: "聊天消息格式无效"
    case .oversized: "聊天记录超过 64 KiB"
    case .unknownType: "聊天内容类型不支持"
    }
  }
}
extension JSONValue {
  public var object: [String: JSONValue]? { if case .object(let v) = self { v } else { nil } }
  public var array: [JSONValue]? { if case .array(let v) = self { v } else { nil } }
  public var string: String? { if case .string(let v) = self { v } else { nil } }
  public var number: Double? { if case .number(let v) = self { v } else { nil } }
  public var bool: Bool? { if case .bool(let v) = self { v } else { nil } }
}
public struct ChatMessage: Codable, Equatable, Sendable, Identifiable {
  public let protocolVersion: Int
  public let id, hostId, pluginId, conversationId, deviceId, kind: String
  public let createdAt: Int64
  public let text: String?
  public let card: JSONValue?
  public let expiresAt: Int64?
  public let botVersion: String?
  public let requestId, actionId: String?
  public let values: [String: JSONValue]?
  public var isBot: Bool { kind == "botText" || kind == "request" }
  public var preview: String { text ?? card?.object?["title"]?.string ?? "卡片回复" }
  public var supportedCard: ChatCard? {
    guard let card, (try? Contract.validateCard(card)) != nil else { return nil }
    return try? JSONDecoder().decode(ChatCard.self, from: JSONEncoder().encode(card))
  }
}
public struct ChatCard: Codable, Equatable, Sendable {
  public struct Option: Codable, Equatable, Sendable, Identifiable { public let id, label: String }
  public struct Field: Codable, Equatable, Sendable, Identifiable {
    public let id, label, type: String
    public let required: Bool
    public let options: [Option]?
    public let maxLength: Int?
    public let minimum, maximum: Double?
  }
  public struct Block: Codable, Equatable, Sendable {
    public struct Value: Codable, Equatable, Sendable { public let label, value: String }
    public let type: String
    public let text: String?
    public let fields: [Value]?
  }
  public struct Action: Codable, Equatable, Sendable, Identifiable {
    public let id, label: String
    public let style: String?
  }
  public let version: Int
  public let template, title, summary: String
  public let blocks: [Block]
  public let inputs: [Field]
  public let actions: [Action]
  public func validate(actionId: String, values: [String: JSONValue]) throws {
    guard actions.contains(where: { $0.id == actionId }),
      Set(values.keys).isSubset(of: Set(inputs.map(\.id)))
    else { throw ChatError.invalidMessage }
    for field in inputs {
      guard let value = values[field.id] else {
        if field.required { throw SQLiteFailure(message: "请填写：" + field.label) }
        continue
      }
      var valid = false
      switch field.type {
      case "text":
        if let v = value.string {
          valid =
            (!field.required || !v.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            && v.utf16.count <= (field.maxLength ?? 16000)
        }
      case "number":
        if let v = value.number {
          valid =
            v.isFinite && (field.minimum.map { v >= $0 } ?? true)
            && (field.maximum.map { v <= $0 } ?? true)
        }
      case "boolean": valid = value.bool != nil
      case "select": valid = field.options?.contains { $0.id == value.string } ?? false
      case "multiSelect":
        if let v = value.array {
          let strings = v.compactMap(\.string)
          valid =
            strings.count == v.count && (!field.required || !v.isEmpty)
            && Set(strings).count == v.count
            && strings.allSatisfy { s in field.options?.contains { $0.id == s } ?? false }
        }
      default: break
      }
      if !valid { throw SQLiteFailure(message: "输入格式无效：" + field.label) }
    }
  }
}
public struct RequestState: Codable, Sendable {
  public let protocolVersion: Int
  public let requestId, phase: String
  public let revision: Int
  public let updatedAt: Int64
  public let responseId: String?
}
public struct Delivery: Codable, Sendable {
  public let eventId, status: String
  public let progress, error: String?
}
public struct ChatHost: Codable, Sendable, Identifiable {
  public let id, name: String
  public let updatedAt: Int64
}
public struct ChatBot: Codable, Sendable, Identifiable {
  public let hostId, pluginId, conversationId, name, icon, version: String
  public let enabled: Bool
  public var id: String { conversationId }
}
public func chatConversationID(hostId: String, pluginId: String) -> String {
  "chat:" + hostId + ":" + pluginId
}
public func chatDigest(_ values: [String]) throws -> String {
  let encoder = JSONEncoder()
  encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
  return SHA256.hash(data: try encoder.encode(values.sorted())).map { String(format: "%02x", $0) }
    .joined()
}

/// Generated Zod JSON schemas are the structural source of truth for both runtimes.
public enum Contract {
  private static let schemas: JSONValue = {
    try! JSONDecoder().decode(
      JSONValue.self,
      from: Data(contentsOf: Bundle.module.url(forResource: "contracts", withExtension: "json")!))
  }()
  public static func validate(type: String, data: Data) throws {
    guard data.count <= 65536 else { throw ChatError.oversized }
    let value = try JSONDecoder().decode(JSONValue.self, from: data)
    guard let object = value.object, object["protocolVersion"] == .number(2) else {
      throw ChatError.unsupportedVersion
    }
    guard let schema = schemas.object?[type] else { throw ChatError.unknownType }
    var checked = value
    // Unknown cards remain readable as a summary, but can never be submitted.
    if type == "FnChatBotMessage", object["kind"] == .string("request"), let card = object["card"],
      (try? validateCard(card)) == nil
    {
      guard let c = card.object, let title = c["title"]?.string, !title.isEmpty,
        title.utf16.count <= 160, (c["summary"]?.string?.utf16.count ?? 513) <= 512
      else { throw ChatError.invalidMessage }
      var copy = object
      copy["card"] = .object([
        "version": .number(1), "template": .string("approval"), "title": .string(title),
        "summary": c["summary"]!, "blocks": .array([]), "inputs": .array([]),
        "actions": .array([.object(["id": .string("unsupported"), "label": .string("不支持")])]),
      ])
      checked = .object(copy)
    }
    try validate(checked, schema: schema, root: schema)
    if let host = object["hostId"]?.string, let plugin = object["pluginId"]?.string {
      guard object["conversationId"] == .string(chatConversationID(hostId: host, pluginId: plugin))
      else { throw ChatError.invalidMessage }
    }
    if let kind = object["kind"]?.string {
      let expected =
        kind == "userText"
        ? "FnChatUserMessage" : kind == "response" ? "FnChatResponse" : "FnChatBotMessage"
      guard expected == type else { throw ChatError.invalidMessage }
      if kind == "botText" || kind == "request" {
        guard object["deviceId"] == object["hostId"] else { throw ChatError.invalidMessage }
      }
      if kind == "userText" {
        guard let text = object["text"]?.string,
          !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        else { throw ChatError.invalidMessage }
      }
      if kind == "request" {
        guard let expires = object["expiresAt"]?.number, let created = object["createdAt"]?.number,
          expires > created
        else { throw ChatError.invalidMessage }
      }
    }
  }
  public static func identity(type: String, data: Data) throws -> String {
    let o = try JSONDecoder().decode(JSONValue.self, from: data).object ?? [:]
    func s(_ key: String) -> String { o[key]?.string ?? "" }
    switch type {
    case "FnChatBotMessage", "FnChatUserMessage", "FnChatResponse": return "message:" + s("id")
    case "FnChatRequestState": return "state:" + s("requestId")
    case "FnChatDelivery": return "delivery:" + s("eventId")
    case "FnChatHost": return "host:" + s("id")
    case "FnChatClient": return "client:" + s("id")
    case "FnChatBot": return "bot:" + s("hostId") + ":" + s("pluginId")
    case "FnChatReceipt": return "read:" + s("messageId")
    case "FnChatArchive": return "archive:" + s("conversationId")
    default: throw ChatError.unknownType
    }
  }
  public static func validateCard(_ card: JSONValue) throws {
    guard let root = schemas.object?["FnChatBotMessage"],
      let variant = root.object?["oneOf"]?.array?.first(where: {
        $0.object?["properties"]?.object?["kind"]?.object?["const"] == .string("request")
      }), let schema = variant.object?["properties"]?.object?["card"]
    else { throw ChatError.invalidMessage }
    try validate(card, schema: schema, root: root)
    let c = try JSONDecoder().decode(ChatCard.self, from: JSONEncoder().encode(card))
    guard Set(c.inputs.map(\.id)).count == c.inputs.count,
      Set(c.actions.map(\.id)).count == c.actions.count
    else { throw ChatError.invalidMessage }
    for f in c.inputs {
      guard (["select", "multiSelect"].contains(f.type)) == (f.options != nil),
        f.options.map({ Set($0.map(\.id)).count == $0.count }) ?? true,
        f.maxLength == nil || f.type == "text",
        (f.minimum == nil && f.maximum == nil) || f.type == "number"
      else { throw ChatError.invalidMessage }
      if let min = f.minimum, let max = f.maximum, min > max { throw ChatError.invalidMessage }
    }
  }
  static func validate(_ value: JSONValue, schema: JSONValue, root: JSONValue) throws {
    guard let s = schema.object else {
      if schema == .bool(false) { throw ChatError.invalidMessage }
      return
    }
    if let ref = s["$ref"]?.string {
      var target = root
      for part in ref.dropFirst(2).split(separator: "/") {
        guard
          let next = target.object?[
            String(part).replacingOccurrences(of: "~1", with: "/").replacingOccurrences(
              of: "~0", with: "~")]
        else { throw ChatError.invalidMessage }
        target = next
      }
      try validate(value, schema: target, root: root)
      return
    }
    for key in ["anyOf", "oneOf"] {
      if let variants = s[key]?.array {
        guard variants.contains(where: { (try? validate(value, schema: $0, root: root)) != nil })
        else { throw ChatError.invalidMessage }
        return
      }
    }
    if let expected = s["const"], value != expected { throw ChatError.invalidMessage }
    if let allowed = s["enum"]?.array, !allowed.contains(value) { throw ChatError.invalidMessage }
    switch s["type"]?.string {
    case "object":
      guard let object = value.object else { throw ChatError.invalidMessage }
      let props = s["properties"]?.object ?? [:]
      for key in s["required"]?.array?.compactMap(\.string) ?? [] where object[key] == nil {
        throw ChatError.invalidMessage
      }
      for (key, v) in object {
        if let prop = props[key] {
          try validate(v, schema: prop, root: root)
        } else if let additional = s["additionalProperties"] {
          try validate(v, schema: additional, root: root)
        }
      }
    case "array":
      guard let a = value.array, Double(a.count) >= (s["minItems"]?.number ?? 0),
        Double(a.count) <= (s["maxItems"]?.number ?? .infinity)
      else { throw ChatError.invalidMessage }
      if let item = s["items"] { for v in a { try validate(v, schema: item, root: root) } }
    case "string":
      guard let v = value.string, Double(v.utf16.count) >= (s["minLength"]?.number ?? 0),
        Double(v.utf16.count) <= (s["maxLength"]?.number ?? .infinity)
      else { throw ChatError.invalidMessage }
      if let pattern = s["pattern"]?.string,
        v.range(of: pattern, options: .regularExpression) == nil
      {
        throw ChatError.invalidMessage
      }
    case "number", "integer":
      guard let n = value.number, n.isFinite, n >= (s["minimum"]?.number ?? -.infinity),
        n <= (s["maximum"]?.number ?? .infinity),
        s["type"] != .string("integer") || n.rounded() == n
      else { throw ChatError.invalidMessage }
    case "boolean": guard value.bool != nil else { throw ChatError.invalidMessage }
    case "null": guard value == .null else { throw ChatError.invalidMessage }
    default: break
    }
  }
}
