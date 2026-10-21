import Foundation
import FnChatCore
import SwiftUI
import Testing
@testable import FnChatUI

@Test @MainActor func sessionCardFitsPhoneAndDesktopWidths() throws {
  let object: [String: Any] = ["id": "card", "hostId": "host", "sessionId": "session", "card": [
    "id": "card", "sessionId": "session", "createdAt": 1, "expiresAt": 2, "state": "completed",
    "answer": ["actionId": "ok", "values": ["note": "已保存的笔记", "count": 2, "confirm": true, "choice": "a", "tags": ["a"]]],
    "card": ["version": 1, "template": "form", "title": "保存笔记", "summary": "确认后保存到此应用",
      "blocks": [["type": "text", "text": "**检查内容**\n保持原始换行。"], ["type": "fields", "fields": [["label": "来源", "value": "应用"]]], ["type": "divider"]],
      "inputs": [["id": "note", "label": "内容", "type": "text", "required": true], ["id": "count", "label": "数量", "type": "number", "required": true],
        ["id": "confirm", "label": "确认", "type": "boolean", "required": true], ["id": "choice", "label": "选择", "type": "select", "required": true, "options": [["id": "a", "label": "选项 A"]]],
        ["id": "tags", "label": "标签", "type": "multiSelect", "required": true, "options": [["id": "a", "label": "标签 A"]]]],
      "actions": [["id": "ok", "label": "保存", "style": "primary"]]]]]
  let record = try JSONDecoder().decode(SessionCardRecord.self, from: JSONSerialization.data(withJSONObject: object))
  let model = SessionModel()
  for width in [280.0, 560.0] {
    for scheme in [ColorScheme.light, .dark] {
      let content = SessionCardView(record: record).environmentObject(model).padding(12)
        .frame(width: width, alignment: .leading).environment(\.colorScheme, scheme)
      let renderer = ImageRenderer(content: content)
      renderer.proposedSize = .init(width: width, height: nil); renderer.scale = 2
      let image = try #require(renderer.cgImage)
      #expect(image.width == Int(width * 2))
      #expect(image.height > 200 && image.height < 4000)
    }
  }
}
