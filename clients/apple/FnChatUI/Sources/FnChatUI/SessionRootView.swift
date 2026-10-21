import CloudKit
import FnChatCore
import SwiftUI

public struct SessionRootView: View {
  @ObservedObject private var model: SessionModel
  @Environment(\.scenePhase) private var phase
  @State private var creating = false
  @State private var archived = false
  @State private var compactColumn: NavigationSplitViewColumn = .sidebar
  public init(model: SessionModel = .shared) { self.model = model }
  public var body: some View {
    NavigationSplitView(preferredCompactColumn: $compactColumn) {
      List {
        Picker("服务端", selection: $model.selectedHost) {
          ForEach(model.sync.hosts()) { Text($0.name).tag($0.id) }
        }.onChange(of: model.selectedHost) { _, _ in model.selectedSession = nil }
        Toggle("查看归档", isOn: $archived)
        Section("会话") {
          ForEach(model.sync.sessions(host: model.selectedHost).filter { $0.session.archived == archived }) { summary in
            Button { model.selectedSession = summary.id } label: {
              VStack(alignment: .leading) {
                Text(summary.session.title.isEmpty ? "新会话" : summary.session.title)
                Text(summary.session.modelId).font(.caption).foregroundStyle(.secondary)
                let unread = model.sync.unreadCount(host: summary.hostId, session: summary.id)
                if unread > 0 { Text("\(unread) 条未读").font(.caption.bold()).foregroundStyle(Color.accentColor) }
              }
            }.buttonStyle(.plain)
          }
        }
        Section {
          Text(model.sync.status).font(.caption)
          if model.sync.pendingCount > 0 { Text("\(model.sync.pendingCount) 条命令等待上传").font(.caption) }
          ForEach(Array(model.sync.failures.prefix(3).enumerated()), id: \.offset) { _, error in Text(error).font(.caption).foregroundStyle(.red) }
          Button("允许通知") { Task { await model.notifications() } }
          Text(model.pushStatus).font(.caption)
        }
      }
      .navigationTitle("fn Chat")
      .toolbar {
        Button { creating = true } label: { Label("新会话", systemImage: "square.and.pencil") }
          .disabled(model.sync.endpoints(host: model.selectedHost).isEmpty)
        Button { Task { await model.resume() } } label: { Label("同步", systemImage: "arrow.clockwise") }
      }
    } detail: {
      if let id = model.selectedSession { SessionConversation(id: id).id(id) }
      else { ContentUnavailableView("选择或创建会话", systemImage: "bubble.left.and.bubble.right", description: Text("会话固定使用一个模型连接，可以在该连接内切换模型。")) }
    }
    .environmentObject(model)
    .onChange(of: model.selectedSession) { _, value in if value != nil { compactColumn = .detail } }
    .sheet(isPresented: $creating) { NewSessionView().environmentObject(model) }
    .task { await model.resume() }
    .task {
      while !Task.isCancelled {
        do { try await Task.sleep(for: .seconds(3)) } catch { return }
        if phase == .active { await model.resume() }
      }
    }
    .onChange(of: phase) { _, value in if value == .active { Task { await model.resume() } } }
    .onReceive(NotificationCenter.default.publisher(for: .CKAccountChanged)) { _ in model.accountChanged() }
    .alert("操作未完成", isPresented: Binding(get: { !model.error.isEmpty }, set: { if !$0 { model.error = "" } })) {
      Button("好") { model.error = "" }
    } message: { Text(model.error) }
  }
}
private struct NewSessionView: View {
  @EnvironmentObject private var model: SessionModel
  @Environment(\.dismiss) private var dismiss
  @State private var endpoint = ""
  @State private var connection = ""
  @State private var modelID = ""
  private var endpoints: [SessionEndpoint] { model.sync.endpoints(host: model.selectedHost) }
  private var connections: [SessionConnection] { model.sync.connections(host: model.selectedHost) }
  private var models: [SessionConnection.Model] { connections.first { $0.id == connection }?.models ?? [] }
  var body: some View {
    NavigationStack {
      Form {
        Picker("应用", selection: $endpoint) { ForEach(endpoints) { Text($0.name).tag($0.id) } }
        Picker("模型连接", selection: $connection) { ForEach(connections) { Text($0.name).tag($0.id) } }
          .onChange(of: connection) { _, _ in modelID = models.first?.id ?? "" }
        Picker("模型", selection: $modelID) { ForEach(models) { Text($0.name).tag($0.id) } }
        if connections.isEmpty { Text("请先在桌面设置中添加模型，然后同步。").foregroundStyle(.secondary) }
        Text("只显示桌面已添加且当前可用的模型。移除列表项不会改写已有会话。").font(.caption).foregroundStyle(.secondary)
        Text("写文件、运行命令和打开网址将请求批准。").font(.caption).foregroundStyle(.secondary)
      }
      .navigationTitle("新会话")
      .toolbar {
        ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } }
        ToolbarItem(placement: .confirmationAction) {
          Button("创建") {
            guard let selected = endpoints.first(where: { $0.id == endpoint }) else { return }
            model.command("create", fields: ["appId": selected.appId, "endpointId": selected.endpointId, "connectionId": connection, "modelId": modelID])
            if model.error.isEmpty { dismiss() }
          }.disabled(endpoint.isEmpty || connection.isEmpty || modelID.isEmpty)
        }
      }
      .onAppear { endpoint = endpoints.first?.id ?? ""; connection = connections.first?.id ?? ""; modelID = models.first?.id ?? "" }
      .onChange(of: connections.map(\.id)) { _, ids in
        if !ids.contains(connection) { connection = ids.first ?? ""; modelID = models.first?.id ?? "" }
      }
      .onChange(of: models.map(\.id)) { _, ids in if !ids.contains(modelID) { modelID = ids.first ?? "" } }
    }.frame(minWidth: 300, minHeight: 300)
  }
}
private struct SessionConversation: View {
  @EnvironmentObject private var model: SessionModel
  let id: String
  @Environment(\.scenePhase) private var phase
  private func markRead() {
    guard phase == .active else { return }
    do { try model.sync.markRead(host: model.selectedHost, session: id) }
    catch { model.error = error.localizedDescription }
  }
  private var summary: SessionSummary? { model.sync.sessions(host: model.selectedHost).first { $0.id == id } }
  private var items: [SessionDisplayItem] { model.sync.items(host: model.selectedHost, session: id) }
  private var draft: Binding<String> { Binding(get: { model.drafts[id] ?? "" }, set: { model.drafts[id] = $0 }) }
  var body: some View {
    VStack(spacing: 0) {
      ScrollViewReader { proxy in
        ScrollView {
          LazyVStack(alignment: .leading, spacing: 16) {
            ForEach(items) { item in
              VStack(alignment: .leading, spacing: 6) {
                Text(item.kind == "user" ? "你" : item.kind == "assistant" ? "助手" : item.toolName ?? "工具 / 状态")
                  .font(.caption.bold()).foregroundStyle(.secondary)
                if let reasoning = item.reasoning { DisclosureGroup("思考") { ChatMarkdown(text: reasoning) } }
                ChatMarkdown(text: item.text)
                if item.truncated { Text("内容已截断；完整记录保留在服务端。").font(.caption).foregroundStyle(.secondary) }
                if item.state == "interrupted" || item.state == "failed" { Text(item.state == "failed" ? "失败" : "已中断").font(.caption).foregroundStyle(.orange) }
              }.padding(12).frame(maxWidth: .infinity, alignment: .leading)
                .background(item.kind == "user" ? Color.accentColor.opacity(0.08) : Color.secondary.opacity(0.05), in: RoundedRectangle(cornerRadius: 10))
                .id(item.id)
            }
            ForEach(model.sync.cards(host: model.selectedHost, session: id)) { record in
              SessionCardView(record: record).padding(12).frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.secondary.opacity(0.05), in: RoundedRectangle(cornerRadius: 10))
            }
          }.padding()
        }.onChange(of: items.last?.id) { _, value in if let value { proxy.scrollTo(value, anchor: .bottom) } }
      }
      if let summary {
        ForEach(summary.approvals) { approval in
          VStack(alignment: .leading) {
            Text("允许 \(approval.toolName)？").font(.headline)
            if let reason = approval.reason { Text(reason).font(.caption) }
            HStack {
              Button("拒绝") { model.command("approval", fields: ["sessionId": id, "approvalId": approval.id, "allow": false]) }
              Button("允许一次") { model.command("approval", fields: ["sessionId": id, "approvalId": approval.id, "allow": true]) }
            }
          }.padding().frame(maxWidth: .infinity, alignment: .leading).background(.orange.opacity(0.1))
        }
      }
      Divider()
      HStack(alignment: .bottom) {
        TextField("发送消息", text: draft, axis: .vertical).lineLimit(1...6).textFieldStyle(.roundedBorder)
        Button("发送") {
          model.command("send", fields: ["sessionId": id, "text": draft.wrappedValue])
          if model.error.isEmpty { draft.wrappedValue = "" }
        }.disabled(draft.wrappedValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
      }.padding()
    }
    .onAppear { markRead() }
    .onChange(of: items.last?.seq) { _, _ in markRead() }
    .onChange(of: phase) { _, value in if value == .active { markRead() } }
    .navigationTitle(summary?.session.title ?? "会话")
    .toolbar {
      if let summary {
        Menu("模型") {
          let models = model.sync.connections(host: model.selectedHost).first { $0.id == summary.session.connectionId }?.models ?? []
          if models.isEmpty { Text("请先在桌面添加模型并同步") }
          ForEach(models) { value in Button(value.name) { model.command("model", fields: ["sessionId": id, "modelId": value.id]) } }
        }.disabled(summary.session.status == "running")
        Button("停止") { model.command("cancel", fields: ["sessionId": id]) }.disabled(summary.session.status != "running")
        Button(summary.session.archived ? "恢复" : "归档") { model.command("archive", fields: ["sessionId": id, "archived": !summary.session.archived]); model.selectedSession = nil }
      }
    }
  }
}
