import Foundation

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
