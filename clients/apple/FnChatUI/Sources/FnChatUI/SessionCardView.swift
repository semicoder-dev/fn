import FnChatCore
import SwiftUI

struct SessionCardView: View {
  let record: SessionCardRecord
  @EnvironmentObject private var model: SessionModel
  @State private var texts: [String: String] = [:]
  @State private var booleans: [String: Bool] = [:]
  @State private var selections: [String: Set<String>] = [:]
  @State private var included = Set<String>()
  private var editable: Bool { model.sync.cardAvailable(record) }
  var body: some View {
    TimelineView(.periodic(from: .now, by: 30)) { _ in content }
      .onAppear { showAcceptedValues() }
      .onChange(of: record.card.state) { _, _ in showAcceptedValues() }
  }
  private func showAcceptedValues() {
    guard let values = record.card.answer?.values else { return }
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
    let card = record.card.card
    if card.version == 1 {
      VStack(alignment: .leading, spacing: 12) {
        Text(card.title).font(.headline)
        if !card.summary.isEmpty { Text(card.summary).font(.subheadline) }
        ForEach(Array(card.blocks.enumerated()), id: \.offset) { _, block in
          switch block.type {
          case "text": ChatMarkdown(text: block.text ?? "").equatable()
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
        Text(model.sync.pendingCard(host: record.hostId, id: record.id) ? "回复等待宿主确认" : stateLabel)
          .font(.caption).foregroundStyle(.secondary)
        if let error = record.card.error { Text(error).font(.caption).foregroundStyle(.red) }
      }
    } else {
      VStack(alignment: .leading) {
        Text(card.title).font(.headline)
        Text(card.summary)
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
  private var stateLabel: String {
    if record.card.state == "pending" && record.card.expiresAt <= Int64(Date().timeIntervalSince1970 * 1000) { return "已过期" }
    return ["pending": "等待回复", "running": "处理中", "completed": "已完成", "failed": "处理失败", "cancelled": "已取消", "expired": "已过期", "interrupted": "已中断，未自动重试"][record.card.state] ?? record.card.state
  }
  private func submit(_ card: ChatCard, _ action: String) {
    do {
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
      try model.sync.respondCard(record, action: action, values: values)
    } catch { model.error = error.localizedDescription }
  }
}
