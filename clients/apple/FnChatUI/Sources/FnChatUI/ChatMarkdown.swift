import MarkdownUI
import SwiftUI

#if os(macOS)
  import AppKit
#else
  import UIKit
#endif

/// Shared by both native clients. The stored message remains the original Markdown source.
struct ChatMarkdown: View, Equatable {
  let text: String

  var body: some View {
    Markdown(text)
      .markdownSoftBreakMode(.lineBreak)
      .markdownImageProvider(ChatImageLink())
      .markdownInlineImageProvider(ChatInlineImagePlaceholder())
      .markdownTextStyle {
        ForegroundColor(.primary)
        FontSize(.em(1))
      }
      .markdownTextStyle(\.link) { ForegroundColor(.accentColor) }
      .markdownTextStyle(\.code) {
        FontFamilyVariant(.monospaced)
        BackgroundColor(.secondary.opacity(0.12))
      }
      .markdownBlockStyle(\.blockquote) { configuration in
        configuration.label
          .padding(.leading, 12)
          .overlay(alignment: .leading) {
            RoundedRectangle(cornerRadius: 2).fill(.secondary.opacity(0.4)).frame(width: 3)
          }
          .markdownMargin(top: 0, bottom: 12)
      }
      .markdownBlockStyle(\.codeBlock) { configuration in
        VStack(alignment: .leading, spacing: 0) {
          HStack {
            Text(configuration.language ?? "代码").font(.caption).foregroundStyle(.secondary)
            Spacer()
            Button {
              copyChatText(configuration.content)
            } label: {
              Label("复制代码", systemImage: "doc.on.doc").font(.caption)
            }.buttonStyle(.borderless)
          }.padding(10)
          Divider()
          ScrollView(.horizontal) {
            configuration.label
              .fixedSize(horizontal: true, vertical: true)
              .markdownTextStyle {
                FontFamilyVariant(.monospaced)
                FontSize(.em(0.9))
                BackgroundColor(nil)
              }
              .padding(10)
          }
        }
        .background(.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
        .markdownMargin(top: 0, bottom: 12)
      }
      .markdownBlockStyle(\.table) { configuration in
        ScrollView(.horizontal) {
          configuration.label
            .fixedSize(horizontal: true, vertical: true)
            .markdownTableBorderStyle(.init(color: .secondary.opacity(0.25)))
        }.markdownMargin(top: 0, bottom: 12)
      }
      .textSelection(.enabled)
      .environment(
        \.openURL,
        OpenURLAction { url in
          chatMarkdownAllowsLink(url) ? .systemAction : .discarded
        }
      )
      .contextMenu {
        Button("复制原文", systemImage: "doc.on.doc") { copyChatText(text) }
      }
  }
}

// Chat has no image attachments. Keep remote images explicit instead of fetching on message display.
private struct ChatImageLink: ImageProvider {
  func makeImage(url: URL?) -> some View {
    if let url, ["http", "https"].contains(url.scheme?.lowercased() ?? ""),
      chatMarkdownAllowsLink(url)
    {
      Link(destination: url) { Label("查看图片", systemImage: "photo") }
    } else {
      Label("图片", systemImage: "photo").foregroundStyle(.secondary)
    }
  }
}

private struct ChatInlineImagePlaceholder: InlineImageProvider {
  func image(with url: URL, label: String) async throws -> Image {
    Image(systemName: "photo")
  }
}

/// Markdown links may open a webpage or compose mail, but never execute app/file URLs.
func chatMarkdownAllowsLink(_ url: URL) -> Bool {
  switch url.scheme?.lowercased() {
  case "https", "http":
    return url.host?.isEmpty == false && url.user == nil && url.password == nil
  case "mailto":
    return !url.path.isEmpty
  default:
    return false
  }
}

@MainActor private func copyChatText(_ text: String) {
  #if os(macOS)
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(text, forType: .string)
  #else
    UIPasteboard.general.string = text
  #endif
}
