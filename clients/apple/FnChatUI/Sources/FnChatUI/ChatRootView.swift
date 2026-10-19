import CloudKit
import FnChatCore
import SwiftUI

public struct ChatRootView: View {
  @ObservedObject private var model: ChatModel
  @Environment(\.scenePhase) private var phase
  public init(model: ChatModel = .shared) { self.model = model }
  public var body: some View {
    Group {
      #if os(macOS)
        NavigationSplitView {
          ConversationList().navigationSplitViewColumnWidth(min: 260, ideal: 300, max: 400)
        } detail: {
          if let id = model.selectedConversation {
            ChatConversation(id: id).id(id)
          } else {
            ContentUnavailableView(
              "选择一个机器人", systemImage: "bubble.left.and.bubble.right",
              description: Text("向电脑端插件发送文字，或填写它发来的请求卡片。"))
          }
        }.frame(minWidth: 760, minHeight: 520)
      #else
        NavigationStack(
          path: Binding(
            get: { model.selectedConversation.map { [$0] } ?? [] },
            set: { model.selectedConversation = $0.last })
        ) {
          ConversationList().navigationDestination(for: String.self) {
            ChatConversation(id: $0).id($0)
          }
        }
      #endif
    }
    .environmentObject(model)
    .sheet(isPresented: $model.showingSettings) { ChatSettings().environmentObject(model) }
    .task { await model.resume() }
    .task {
      while !Task.isCancelled {
        do { try await Task.sleep(for: .seconds(60)) } catch { return }
        if phase == .active { await model.resume() }
      }
    }
    .onChange(of: phase) { _, value in if value == .active { Task { await model.resume() } } }
    .onReceive(NotificationCenter.default.publisher(for: .CKAccountChanged)) { _ in
      model.accountChanged()
    }
    .alert(
      "操作未完成",
      isPresented: Binding(get: { !model.error.isEmpty }, set: { if !$0 { model.error = "" } })
    ) {
      Button("好") { model.error = "" }
    } message: {
      Text(model.error)
    }
  }
}
private struct ConversationList: View {
  @EnvironmentObject private var model: ChatModel
  @State private var archived = false
  private var messages: [ChatMessage] { model.sync.messages() }
  private var bots: [ChatBot] {
    model.sync.bots().filter {
      $0.hostId == model.selectedHost && model.sync.isArchived($0.id) == archived
    }.sorted { left, right in
      let l = messages.last(where: { $0.conversationId == left.id })?.createdAt ?? 0
      let r = messages.last(where: { $0.conversationId == right.id })?.createdAt ?? 0
      return l == r ? left.name < right.name : l > r
    }
  }

  var body: some View {
    List {
      Section {
        Picker(
          "服务端", selection: Binding(get: { model.selectedHost }, set: { model.selectHost($0) })
        ) {
          if model.sync.hosts().isEmpty { Text("尚未发现服务端").tag("") }
          ForEach(model.sync.hosts()) { host in
            Text(
              host.name
                + (model.unread(host: host.id) > 0 ? " · \(model.unread(host: host.id))" : "")
            ).tag(host.id)
          }
        }
        Toggle("查看归档", isOn: $archived)
      }
      ForEach(bots) { bot in
        #if os(macOS)
          Button {
            model.selectedConversation = bot.id
          } label: {
            row(bot)
          }.buttonStyle(.plain)
        #else
          NavigationLink(value: bot.id) { row(bot) }
        #endif
      }
      if bots.isEmpty {
        ContentUnavailableView(
          "暂无机器人会话", systemImage: "bubble.left.and.bubble.right",
          description: Text("在所选电脑的 fn 中启用聊天插件，并完成 iCloud 同步。"))
      }
      Section {
        Text(model.sync.status).font(.caption).foregroundStyle(.secondary)
        if model.sync.pendingCount > 0 { Text("\(model.sync.pendingCount) 条待发送").font(.caption) }
      }
    }
    .navigationTitle("聊天")
    .toolbar {
      Button {
        model.showingSettings = true
      } label: {
        Label("设置", systemImage: "gearshape")
      }
    }
    .refreshable { await model.resume() }
  }
  private func row(_ bot: ChatBot) -> some View {
    let latest = messages.last { $0.conversationId == bot.id }
    let unread = messages.filter { $0.conversationId == bot.id && !model.sync.isRead($0) }.count
    let pending = messages.filter {
      $0.conversationId == bot.id && $0.kind == "request"
        && model.sync.state($0.id)?.phase == "pending" && ($0.expiresAt ?? 0) > model.sync.now
    }.count
    return HStack(alignment: .top, spacing: 10) {
      Text(bot.icon).font(.title2).frame(width: 38, height: 38).background(
        .quaternary, in: RoundedRectangle(cornerRadius: 10))
      VStack(alignment: .leading, spacing: 4) {
        HStack {
          Text(bot.name).font(.headline)
          Spacer()
          if let latest {
            Text(Date(timeIntervalSince1970: Double(latest.createdAt) / 1000), style: .time).font(
              .caption
            ).foregroundStyle(.secondary)
          }
        }
        Text(latest?.preview ?? "发送第一条消息").font(.subheadline).foregroundStyle(.secondary).lineLimit(
          2)
        HStack {
          if !bot.enabled { Text("机器人不可用") }
          if pending > 0 { Text("\(pending) 个请求待处理") }
          if unread > 0 { Text("\(unread) 条未读").foregroundStyle(.tint) }
        }.font(.caption)
      }
    }.padding(.vertical, 6).contentShape(Rectangle())
  }
}
private struct ChatConversation: View {
  let id: String
  @EnvironmentObject private var model: ChatModel
  @Environment(\.scenePhase) private var phase
  @State private var limit = 100
  @State private var visible = Set<String>()
  private var bot: ChatBot? { model.sync.bots().first { $0.id == id } }
  private var messages: [ChatMessage] { model.sync.messages().filter { $0.conversationId == id } }
  private var draft: Binding<String> {
    Binding(get: { model.drafts[id] ?? "" }, set: { model.drafts[id] = $0 })
  }
  var body: some View {
    VStack(spacing: 0) {
      ScrollViewReader { proxy in
        ScrollView {
          LazyVStack(alignment: .leading, spacing: 16) {
            if messages.count > limit { Button("加载更早消息") { limit += 100 } }
            if messages.isEmpty {
              ContentUnavailableView(
                "开始聊天", systemImage: "bubble.left", description: Text("这个会话的消息会同步到你的其他聊天设备。"))
            }
            ForEach(Array(messages.suffix(limit))) { m in
              MessageBubble(message: m).id(m.id)
                .onAppear {
                  visible.insert(m.id)
                  if phase == .active { model.perform { try model.sync.markRead([m]) } }
                }
                .onDisappear { visible.remove(m.id) }
            }
            Color.clear.frame(height: 1).id("bottom")
          }.padding()
        }.defaultScrollAnchor(.bottom)
          .onChange(of: messages.last?.id) { _, _ in
            Task { @MainActor in
              await Task.yield()
              proxy.scrollTo("bottom", anchor: .bottom)
            }
          }
      }
      Divider()
      HStack(alignment: .bottom) {
        TextField("发送文字消息", text: draft, axis: .vertical).lineLimit(1...6).textFieldStyle(.plain)
        Button {
          send()
        } label: {
          Image(systemName: "arrow.up.circle.fill").font(.title2)
        }.buttonStyle(.plain).disabled(
          bot?.enabled != true
            || draft.wrappedValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        ).accessibilityLabel("发送")
      }.padding()
      if bot?.enabled != true {
        Text("机器人不可用，历史记录仍可查看。").font(.caption).foregroundStyle(.secondary).padding(.bottom, 8)
      }
    }
    .navigationTitle(bot?.name ?? "聊天")
    .onChange(of: phase) { _, value in
      if value == .active {
        model.perform { try model.sync.markRead(messages.filter { visible.contains($0.id) }) }
      }
    }
    .toolbar {
      Button(model.sync.isArchived(id) ? "取消归档" : "归档") {
        model.perform { try model.sync.archive(id, archived: !model.sync.isArchived(id)) }
      }
    }
  }
  private func send() {
    guard let bot else { return }
    model.perform {
      _ = try model.sync.sendText(draft.wrappedValue, to: bot)
      draft.wrappedValue = ""
    }
  }
}
private struct MessageBubble: View {
  let message: ChatMessage
  @EnvironmentObject private var model: ChatModel
  var body: some View {
    HStack(alignment: .top) {
      if !message.isBot { Spacer(minLength: 40) }
      VStack(alignment: .leading, spacing: 6) {
        content
        HStack {
          Text(Date(timeIntervalSince1970: Double(message.createdAt) / 1000), style: .time)
          if let failure = model.sync.failure(message.id) {
            Text("发送失败：" + failure).foregroundStyle(.red)
          } else if model.sync.pending(message.id) {
            Text("待发送")
          } else if !message.isBot {
            Text("云端已接收")
          }
        }.font(.caption2).foregroundStyle(.secondary)
        if let delivery = model.sync.delivery(message.id) { DeliveryLabel(delivery: delivery) }
      }.padding(12).background(
        message.isBot ? Color.secondary.opacity(0.10) : Color.accentColor.opacity(0.13),
        in: RoundedRectangle(cornerRadius: 14)
      ).frame(maxWidth: 620, alignment: message.isBot ? .leading : .trailing)
      if message.isBot { Spacer(minLength: 40) }
    }
  }
  @ViewBuilder private var content: some View {
    if message.kind == "request" {
      RequestCardView(message: message)
    } else if message.kind == "response" {
      Text("已提交：" + (message.actionId ?? "回复"))
      if let values = message.values, !values.isEmpty {
        ForEach(values.keys.sorted(), id: \.self) { key in
          Text(key + "：" + display(values[key]!)).font(.callout)
        }
      }
    } else {
      ChatMarkdown(text: message.text ?? "").equatable()
    }
  }
  private func display(_ value: JSONValue) -> String {
    if let text = value.string { return text }
    return (try? JSONEncoder().encode(value)).map { String(decoding: $0, as: UTF8.self) } ?? ""
  }
}
private struct DeliveryLabel: View {
  let delivery: Delivery
  private var label: String {
    ([statusLabel(delivery.status)] + [delivery.progress, delivery.error].compactMap { $0 }).joined(
      separator: " · ")
  }
  var body: some View {
    Text(label).font(.caption).foregroundStyle(delivery.error == nil ? Color.secondary : Color.red)
  }
}

func statusLabel(_ status: String) -> String {
  [
    "pending": "等待回复", "responded": "已回复", "cancelled": "已取消", "expired": "已过期", "running": "处理中",
    "completed": "已完成", "failed": "处理失败", "interrupted": "已中断，结果待确认",
  ][status] ?? status
}
private struct ChatSettings: View {
  @EnvironmentObject private var model: ChatModel
  @Environment(\.dismiss) private var dismiss
  var body: some View {
    NavigationStack {
      Form {
        Section("同步") {
          Text(model.sync.status)
          Text("待发送 \(model.sync.pendingCount) 条")
          Text(model.pushStatus)
          Button("连接并同步 iCloud") { Task { await model.resume() } }
          Button("允许机器人来信提醒") { Task { await model.notifications() } }
        }
        if model.sync.unsupportedCount > 0 {
          Section { Text("有 \(model.sync.unsupportedCount) 条不支持的记录，请升级配套应用。") }
        }
        if !model.sync.failures.isEmpty {
          Section("发送未生效") {
            ForEach(Array(model.sync.failures.enumerated()), id: \.offset) { _, error in
              Text(error).foregroundStyle(.red)
            }
          }
        }
        Section { Text("同一 iCloud 账号共享聊天。每台 fn 宿主是独立服务端，电脑离线时文字排队等待。客户端只发送文字和服务器请求的卡片回复。") }
      }.navigationTitle("聊天设置").toolbar { Button("完成") { dismiss() } }
        #if os(macOS)
          .formStyle(.grouped).frame(width: 480, height: 440)
        #endif
    }
  }
}
