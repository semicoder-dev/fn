import Foundation
import SwiftUI
import Testing

@testable import FnChatUI

#if os(macOS)
  import AppKit
#endif

@Test func markdownLinkDestinations() throws {
  for value in [
    "https://semicoder.dev/fn", "http://example.com/path?q=中文", "mailto:hello@example.com",
  ] {
    #expect(chatMarkdownAllowsLink(try #require(URL(string: value))))
  }
  for value in [
    "javascript:alert(1)", "file:///etc/passwd", "data:text/html,hello", "fn://run/task",
    "https://user:password@example.com", "/relative", "//example.com", "https:", "mailto:",
  ] {
    #expect(!chatMarkdownAllowsLink(try #require(URL(string: value))))
  }
}

@Test @MainActor func codeBlockRetainsAllLines() throws {
  func height(_ lines: Int) throws -> Int {
    let code = Array(repeating: "print(\"完整显示每一行\")", count: lines).joined(separator: "\n")
    let renderer = ImageRenderer(
      content: ChatMarkdown(text: "```swift\n\(code)\n```").frame(width: 280))
    return try #require(renderer.cgImage).height
  }
  #expect(try height(8) > height(1) + 70)
}

// Exercise real SwiftUI layout at phone/desktop widths and export optional visual evidence.
// No CloudKit, model calls or real user messages are involved.
@Test @MainActor func markdownLayout() throws {
  let samples = [
    "document": """
    # Markdown 消息
    **粗体**、*斜体*、~~删除线~~ 和 `inline code`。
    手动换行保留。

    ## 列表与引用
    1. 第一项
       - 嵌套项目
    2. 第二项

    - [x] 已完成
    - [ ] 待处理

    > 引用内容和 [来源链接](https://semicoder.dev/fn)。

    ```swift
    let message = "这是一行很长的代码，横向滚动查看，不撑开整个消息气泡：abcdefghijklmnopqrstuvwxyz0123456789"
    print(message)
    ```

      | 项目 | 说明 | 状态 | 完整标识 |
      | --- | --- | --- | --- |
      | iPhone | 原生 Markdown | 完成 | abcdefghijklmnopqrstuvwxyz0123456789 |
      | Mac | 共用渲染组件 | 完成 | abcdefghijklmnopqrstuvwxyz0123456789 |

    ---
    普通中文和 emoji 👋 保持可读。

    ![图片说明](https://example.com/image.png)
    """,
    "edge-cases": """
    未闭合 **标记、[链接]( 与反斜线 \\ 保持可读。
    https://example.com/abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789

    ```text
    <script>alert('只显示文本')</script>
    **代码中不解析强调**
    """,
  ]
  for (name, text) in samples {
    for width in [280.0, 560.0] {
      for scheme in [ColorScheme.light, .dark] {
        let content = ChatMarkdown(text: text)
          .padding(12)
          .frame(width: width, alignment: .leading)
          .background(scheme == .dark ? Color.black : Color.white)
          .environment(\.colorScheme, scheme)
        let renderer = ImageRenderer(content: content)
        renderer.proposedSize = .init(width: width, height: nil)
        renderer.scale = 2
        let image = try #require(renderer.cgImage)
        #expect(image.width == Int(width * 2))
        #expect(image.height > 100 && image.height < 10_000)
        #if os(macOS)
          if let directory = ProcessInfo.processInfo.environment["FN_MARKDOWN_SNAPSHOTS"] {
            _ = NSApplication.shared
            let host = NSHostingView(rootView: content)
            let size = host.fittingSize
            let window = NSWindow(
              contentRect: NSRect(origin: .zero, size: size), styleMask: .borderless,
              backing: .buffered, defer: false)
            window.isReleasedWhenClosed = false
            window.contentView = host
            window.setFrameOrigin(NSPoint(x: -10_000, y: -10_000))
            window.orderFront(nil)
            RunLoop.main.run(until: Date(timeIntervalSinceNow: 0.15))
            host.layoutSubtreeIfNeeded()
            let bitmap = try #require(host.bitmapImageRepForCachingDisplay(in: host.bounds))
            host.cacheDisplay(in: host.bounds, to: bitmap)
            window.close()
            let data = try #require(bitmap.representation(using: .png, properties: [:]))
            try data.write(
              to: URL(fileURLWithPath: directory).appending(
                path: "\(name)-\(Int(width))-\(scheme).png"))
          }
        #endif
      }
    }
  }
}
