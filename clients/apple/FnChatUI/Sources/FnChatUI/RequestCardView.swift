import FnChatCore
import SwiftUI

struct RequestCardView: View {
  let message: ChatMessage
  @EnvironmentObject private var model: ChatModel
  @State private var texts: [String: String] = [:]
  @State private var booleans: [String: Bool] = [:]
  @State private var selections: [String: Set<String>] = [:]
  @State private var included = Set<String>()
  private var acceptedResponse: ChatMessage? {
    guard let id = model.sync.state(message.id)?.responseId else { return nil }
    return model.sync.messages().first { $0.id == id && $0.requestId == message.id }
  }
  private var editable: Bool {
    model.sync.state(message.id)?.phase == "pending" && (message.expiresAt ?? 0) > model.sync.now
      && !model.sync.pendingResponse(message.id)
      && model.sync.bots().contains {
        $0.id == message.conversationId && $0.enabled && $0.version == message.botVersion
      }
  }
  var body: some View {
    TimelineView(.periodic(from: .now, by: 30)) { _ in content }
      .onAppear { showAcceptedValues() }
      .onChange(of: acceptedResponse?.id) { _, _ in showAcceptedValues() }
  }
  private func showAcceptedValues() {
    guard let values = acceptedResponse?.values else { return }
    included = Set(values.keys)
    for (id, value) in values {
      switch value {
      case .string(let text): texts[id] = text
      case .number(let number): texts[id] = String(number)
      case .bool(let enabled): booleans[id] = enabled
      case .array(let items): selections[id] = Set(items.compactMap(\.string))
      default: break
      }
    }
  }
  @ViewBuilder private var content: some View {
    if let card = message.supportedCard {
      VStack(alignment: .leading, spacing: 12) {
        Text(card.title).font(.headline)
        if !card.summary.isEmpty { Text(card.summary).font(.subheadline) }
        ForEach(Array(card.blocks.enumerated()), id: \.offset) { _, block in
          switch block.type {
          case "text": Text(block.text ?? "").textSelection(.enabled)
          case "divider": Divider()
          case "fields":
            ForEach(Array((block.fields ?? []).enumerated()), id: \.offset) { _, f in
              LabeledContent(f.label, value: f.value)
            }
          default: EmptyView()
          }
        }
        ForEach(card.inputs) { field in
          VStack(alignment: .leading) {
            if !field.required {
              Toggle(
                "填写 \(field.label)（可选）",
                isOn: Binding(
                  get: { included.contains(field.id) },
                  set: { if $0 { included.insert(field.id) } else { included.remove(field.id) } }))
            }
            if field.required || included.contains(field.id) { input(field) }
          }.disabled(!editable)
        }
        ForEach(card.actions) { action in
          Button(action.label, role: action.style == "danger" ? .destructive : nil) {
            submit(card, action.id)
          }.buttonStyle(.bordered).disabled(!editable)
        }
        Text(
          model.sync.pendingResponse(message.id)
            ? "回复待发送，以云端最终状态为准"
            : (model.sync.state(message.id)?.phase == "pending"
              && (message.expiresAt ?? 0) <= model.sync.now
              ? "请求已过期" : statusLabel(model.sync.state(message.id)?.phase ?? "pending"))
        ).font(.caption).foregroundStyle(.secondary)
      }
    } else {
      VStack(alignment: .leading) {
        Text(message.preview).font(.headline)
        Text(message.card?.object?["summary"]?.string ?? "")
        Text("此卡片版本暂不支持，请更新聊天应用。").font(.caption).foregroundStyle(.secondary)
      }
    }
  }
  @ViewBuilder private func input(_ field: ChatCard.Field) -> some View {
    switch field.type {
    case "boolean":
      Toggle(
        field.label,
        isOn: Binding(get: { booleans[field.id] ?? false }, set: { booleans[field.id] = $0 }))
    case "select":
      Picker(
        field.label,
        selection: Binding(get: { texts[field.id] ?? "" }, set: { texts[field.id] = $0 })
      ) {
        Text("请选择").tag("")
        ForEach(field.options ?? []) { Text($0.label).tag($0.id) }
      }
    case "multiSelect":
      Text(field.label)
      ForEach(field.options ?? []) { option in
        Toggle(
          option.label,
          isOn: Binding(
            get: { selections[field.id]?.contains(option.id) ?? false },
            set: {
              if $0 {
                selections[field.id, default: []].insert(option.id)
              } else {
                selections[field.id]?.remove(option.id)
              }
            }))
      }
    default:
      TextField(
        field.label, text: Binding(get: { texts[field.id] ?? "" }, set: { texts[field.id] = $0 }),
        axis: .vertical
      ).textFieldStyle(.roundedBorder)
    }
  }
  private func submit(_ card: ChatCard, _ action: String) {
    model.perform {
      var values: [String: JSONValue] = [:]
      for field in card.inputs where field.required || included.contains(field.id) {
        switch field.type {
        case "boolean": values[field.id] = .bool(booleans[field.id] ?? false)
        case "number":
          guard let number = Double(texts[field.id] ?? ""), number.isFinite else {
            throw SQLiteFailure(message: "请输入数字：" + field.label)
          }
          values[field.id] = .number(number)
        case "multiSelect":
          values[field.id] = .array((selections[field.id] ?? []).sorted().map(JSONValue.string))
        default: values[field.id] = .string(texts[field.id] ?? "")
        }
      }
      try model.sync.respond(message, action: action, values: values)
    }
  }
}
