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
