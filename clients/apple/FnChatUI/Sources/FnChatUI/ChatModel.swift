import CloudKit
import FnChatCore
import Network
import SwiftUI
import UserNotifications

#if os(iOS)
  import UIKit
#else
  import AppKit
#endif
@MainActor public final class ChatModel: ObservableObject {
  public static let shared = ChatModel()
  public let sync: ChatSync
  @Published public var revision = 0
  @Published public var error = ""
  @Published public var selectedHost = ""
  @Published public var selectedConversation: String?
  @Published public var showingSettings = false
  @Published public var pushStatus = "正在注册通知"
  @Published public var drafts: [String: String] = [:]
  private var connecting = false
  private var reconnect = false
  private let network = NWPathMonitor()
  private var pendingNotification = UserDefaults.standard.string(
    forKey: "fnChatPendingNotification")
  public init() {
    let root = URL.applicationSupportDirectory.appending(
      path: Bundle.main.bundleIdentifier ?? "fn-chat")
    sync = ChatSync(root: root)
    sync.changed = { [weak self] in self?.refresh() }
    sync.identityChanged = { [weak self] in self?.clearIdentity() }
    network.pathUpdateHandler = { [weak self] path in
      if path.status == .satisfied { Task { @MainActor [weak self] in await self?.resume() } }
    }
    network.start(queue: DispatchQueue(label: "fn.chat.network"))
  }
  private func refresh() {
    revision += 1
    let hosts = sync.hosts()
    if selectedHost.isEmpty, !hosts.isEmpty {
      selectedHost =
        sync.localValue("selectedHost").flatMap { saved in
          hosts.contains { $0.id == saved } ? saved : nil
        } ?? hosts[0].id
    }
    resolveNotification()
  }
  public func selectHost(_ id: String) {
    selectedHost = id
    selectedConversation = nil
    sync.setLocalValue("selectedHost", id)
  }
  public func accountChanged() {
    sync.disconnect()
    if connecting { reconnect = true } else { Task { await resume() } }
  }
  private func clearIdentity() {
    selectedHost = ""
    selectedConversation = nil
    drafts = [:]
    pendingNotification = nil
    UserDefaults.standard.removeObject(forKey: "fnChatPendingNotification")
  }
  public func resume() async {
    if sync.store != nil {
      await sync.sync()
      if sync.store != nil { return }
    }
    guard !connecting else { return }
    connecting = true
    defer {
      connecting = false
      if reconnect {
        reconnect = false
        Task { await resume() }
      }
    }
    guard
      let container = Bundle.main.object(forInfoDictionaryKey: "FNCloudKitContainer") as? String,
      let environment = Bundle.main.object(forInfoDictionaryKey: "FNCommunicationEnvironment")
        as? String, let bundle = Bundle.main.bundleIdentifier
    else {
      error = "缺少聊天环境配置"
      return
    }
    #if os(iOS)
      let name = UIDevice.current.name
      let platform = "iOS"
    #else
      let name = Host.current().localizedName ?? "Mac"
      let platform = "macOS"
    #endif
    await sync.connect(
      container: container, environment: environment, name: name, platform: platform,
      bundleID: bundle)
  }
  public func perform(_ action: () throws -> Void) {
    do {
      try action()
      error = ""
    } catch { self.error = error.localizedDescription }
  }
  public func notifications() async {
    do {
      let allowed = try await UNUserNotificationCenter.current().requestAuthorization(options: [
        .alert, .badge, .sound,
      ])
      pushStatus = allowed ? "通知已允许" : "通知未允许，可在系统设置开启"
    } catch { self.error = error.localizedDescription }
  }
  public func openNotification(_ id: String?) {
    if let id {
      pendingNotification = id
      UserDefaults.standard.set(id, forKey: "fnChatPendingNotification")
    }
    showingSettings = false
    resolveNotification()
    Task {
      await resume()
      resolveNotification()
    }
  }
  private func resolveNotification() {
    guard let id = pendingNotification,
      let m = sync.messages().first(where: { $0.id == id || "message:" + $0.id == id })
    else { return }
    selectHost(m.hostId)
    selectedConversation = m.conversationId
    pendingNotification = nil
    UserDefaults.standard.removeObject(forKey: "fnChatPendingNotification")
  }
  public func unread(host: String) -> Int {
    sync.messages().filter { $0.hostId == host && !sync.isRead($0) }.count
  }
}
