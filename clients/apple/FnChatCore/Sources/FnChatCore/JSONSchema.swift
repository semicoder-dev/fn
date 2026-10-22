import Foundation

public enum JSONSchema {
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
