import CloudKit
import FnChatCore
import Network
import SwiftUI
import UserNotifications

@MainActor public final class SessionModel: ObservableObject {
  public static let shared = SessionModel()
  public let sync: SessionSync
  @Published public var revision = 0
  @Published public var error = ""
  @Published public var selectedHost = ""
  @Published public var selectedSession: String?
  @Published public var pushStatus = "正在注册通知"
  @Published public var drafts: [String: String] = [:]
  private var connecting = false
  private var reconnect = false
  private var pendingCreate: String?
  private var pendingNotification = UserDefaults.standard.string(forKey: "fnSessionPendingNotification")
  private let network = NWPathMonitor()
  public init() {
    let root = URL.applicationSupportDirectory.appending(path: Bundle.main.bundleIdentifier ?? "fn-chat")
    sync = SessionSync(root: root)
    sync.changed = { [weak self] in self?.refresh() }
    sync.identityChanged = { [weak self] in
      self?.selectedHost = ""; self?.selectedSession = nil; self?.drafts = [:]
      self?.pendingCreate = nil; self?.pendingNotification = nil
      UserDefaults.standard.removeObject(forKey: "fnSessionPendingNotification")
    }
    network.pathUpdateHandler = { [weak self] path in
      if path.status == .satisfied { Task { @MainActor [weak self] in await self?.resume() } }
    }
    network.start(queue: DispatchQueue(label: "fn.session.network"))
  }
  private func refresh() {
    revision += 1
    if selectedHost.isEmpty, let host = sync.hosts().first { selectedHost = host.id }
    if let pendingCreate, let result = sync.results().first(where: { $0.id == pendingCreate }) {
      self.pendingCreate = nil
      if result.status == "completed", let id = result.sessionId { selectedSession = id }
      else { error = result.error ?? "创建会话未完成" }
    }
    if let recordId = pendingNotification {
      if let record = sync.records("FnSessionCard", as: SessionCardRecord.self).first(where: { "FnSessionCard:" + $0.hostId + ":" + $0.id == recordId || $0.id == recordId }) {
        selectedHost = record.hostId; selectedSession = record.sessionId; pendingNotification = nil
        UserDefaults.standard.removeObject(forKey: "fnSessionPendingNotification")
      }
      let records = sync.records("FnSessionReply", as: SessionItemRecord.self)
      if let record = records.first(where: { "FnSessionReply:" + $0.hostId + ":" + $0.id == recordId || $0.id == recordId }) {
        selectedHost = record.hostId; selectedSession = record.sessionId; pendingNotification = nil
        UserDefaults.standard.removeObject(forKey: "fnSessionPendingNotification")
      }
    }
  }
  public func accountChanged() {
    sync.disconnect()
    if connecting { reconnect = true } else { Task { await resume() } }
  }
  public func resume() async {
    if sync.store != nil { await sync.sync(); if sync.store != nil { return } }
    guard !connecting else { return }
    connecting = true
    defer { connecting = false; if reconnect { reconnect = false; Task { await resume() } } }
    guard let container = Bundle.main.object(forInfoDictionaryKey: "FNCloudKitContainer") as? String,
      let environment = Bundle.main.object(forInfoDictionaryKey: "FNCommunicationEnvironment") as? String,
      let bundle = Bundle.main.bundleIdentifier else { error = "缺少聊天环境配置"; return }
    await sync.connect(container: container, environment: environment, bundleID: bundle)
  }
  public func command(_ action: String, fields: [String: Any]) {
    do {
      let id = try sync.enqueue(host: selectedHost, action: action, fields: fields)
      if action == "create" { pendingCreate = id }
      error = ""
    } catch { self.error = error.localizedDescription }
  }
  public func openNotification(_ id: String?) {
    pendingNotification = id
    if let id { UserDefaults.standard.set(id, forKey: "fnSessionPendingNotification") }
    refresh()
    Task { await resume() }
  }
  public func notifications() async {
    do {
      let allowed = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
      pushStatus = allowed ? "通知已允许" : "通知未允许"
    } catch { self.error = error.localizedDescription }
  }
}
