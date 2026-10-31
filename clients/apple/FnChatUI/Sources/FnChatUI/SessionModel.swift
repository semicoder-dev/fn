import CloudKit
import FnChatCore
import Network
import SwiftUI
import UserNotifications

@MainActor public final class SessionModel: ObservableObject {
  public static let shared = SessionModel()
  public let sync: PhoneSync
  @Published public var revision = 0
  @Published public var error = ""
  @Published public var selectedHost = ""
  @Published public var selectedApplication = ""
  @Published public var pushStatus = ""
  @Published public var text = ""
  private var connecting = false
  private let network = NWPathMonitor()
  public var chinese: Bool { Locale.preferredLanguages.first?.hasPrefix("zh") ?? false }
  public init() {
    sync = PhoneSync(
      root: URL.applicationSupportDirectory.appending(
        path: Bundle.main.bundleIdentifier ?? "fn-phone"))
    sync.changed = { [weak self] in self?.refresh() }
    sync.identityChanged = { [weak self] in
      self?.selectedHost = ""
      self?.selectedApplication = ""
      self?.text = ""
    }
    network.pathUpdateHandler = { [weak self] path in
      if path.status == .satisfied { Task { @MainActor [weak self] in await self?.resume() } }
    }
    network.start(queue: DispatchQueue(label: "fn.relay.network"))
  }
  public var hosts: [RelayHost] { sync.store?.hosts() ?? [] }
  public var host: RelayHost? { hosts.first { $0.id == selectedHost } }
  public var application: RelayApplication? {
    host?.applications.first { $0.id == selectedApplication }
  }
  public var messages: [RelayStatus] {
    sync.store?.messages(hostId: selectedHost, instanceId: selectedApplication) ?? []
  }
  private func refresh() {
    revision += 1
    if selectedHost.isEmpty { selectedHost = hosts.first?.id ?? "" }
    if application == nil { selectedApplication = host?.applications.first?.id ?? "" }
    error = sync.error ?? ""
  }
  public func accountChanged() {
    sync.disconnect()
    Task { await resume() }
  }
  public func resume() async {
    if sync.store != nil {
      await sync.sync()
      return
    }
    guard !connecting else { return }
    connecting = true
    defer { connecting = false }
    do {
      guard
        let container = Bundle.main.object(forInfoDictionaryKey: "FNCloudKitContainer") as? String,
        let environment = Bundle.main.object(forInfoDictionaryKey: "FNCommunicationEnvironment")
          as? String
      else { throw RelayError.configuration }
      try await sync.connect(
        container: container,
        transport: AppleRelayTransport(container: container, environment: environment))
      refresh()
    } catch { self.error = error.localizedDescription }
  }
  public func send() {
    guard !selectedHost.isEmpty, !selectedApplication.isEmpty else { return }
    do {
      _ = try sync.store?.enqueue(
        hostId: selectedHost, instanceId: selectedApplication, text: text,
        locale: chinese ? "zh-CN" : "en")
      text = ""
      refresh()
      Task { await sync.sync() }
    } catch { self.error = error.localizedDescription }
  }
  public func retry(_ message: RelayStatus) {
    text = message.text
    send()
  }
  public func openNotification(_ id: String?) { Task { await resume() } }
  public func notifications() async {
    do {
      let allowed = try await UNUserNotificationCenter.current().requestAuthorization(options: [
        .alert, .badge, .sound,
      ])
      pushStatus = L(allowed ? "notificationsOn" : "notificationsOff")
    } catch { self.error = error.localizedDescription }
  }
}
@MainActor func L(_ key: String) -> String {
  let words: [String: (String, String)] = [
    "devices": ("桌面设备", "Desktop devices"), "application": ("应用", "Application"),
    "connect": ("连接桌面上的 Fn", "Connect to Fn on your desktop"),
    "setup": (
      "请使用相同 iCloud 账号，并在桌面 Fn 设置中连接手机。",
      "Use the same iCloud account and connect your phone in Fn settings on the desktop."
    ), "refresh": ("刷新", "Refresh"), "send": ("发送", "Send"),
    "placeholder": ("输入文字…", "Write a message…"),
    "closed": (
      "应用已关闭，请在桌面启动后处理。", "The application is closed. Start it on the desktop to process messages."
    ),
    "offline": (
      "桌面暂时离线，消息将在连接恢复后送达。",
      "The desktop is offline. Messages will be delivered when it reconnects."
    ), "queued": ("等待上传", "Waiting to upload"),
    "waiting": ("等待桌面应用处理", "Waiting for the desktop application"),
    "processing": ("正在处理", "Processing"), "completed": ("已完成", "Completed"),
    "interrupted": ("处理已中断", "Interrupted"), "failed": ("处理失败", "Failed"),
    "cancelled": ("已取消", "Cancelled"), "retry": ("重新发送", "Send again"),
    "notifications": ("通知", "Notifications"), "notificationsOn": ("已允许通知", "Notifications enabled"),
    "notificationsOff": ("未允许通知", "Notifications disabled"),
    "empty": (
      "消息由桌面应用处理，手机负责收发。",
      "Your desktop application processes messages. Your phone sends and receives them."
    ),
  ]
  let pair = words[key] ?? (key, key)
  return Locale.preferredLanguages.first?.hasPrefix("zh") == true ? pair.0 : pair.1
}
