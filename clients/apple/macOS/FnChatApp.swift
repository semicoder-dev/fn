import AppKit
import CloudKit
import FnChatCore
import FnChatUI
import SwiftUI
import UserNotifications

@main struct FnChatApp: App {
  @NSApplicationDelegateAdaptor(MacDelegate.self) private var delegate
  var body: some Scene {
    WindowGroup { ChatRootView() }.defaultSize(width: 960, height: 720)
  }
}
@MainActor
final class MacDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
  private var poll: Task<Void, Never>?
  func applicationDidFinishLaunching(_ notification: Notification) {
    UNUserNotificationCenter.current().delegate = self
    NSApplication.shared.registerForRemoteNotifications()
    poll = Task {
      while !Task.isCancelled {
        do { try await Task.sleep(for: .seconds(60)) } catch { return }
        await ChatModel.shared.resume()
      }
    }
    NSWorkspace.shared.notificationCenter.addObserver(
      self, selector: #selector(wake), name: NSWorkspace.didWakeNotification, object: nil)
  }
  @objc private func wake() { Task { await ChatModel.shared.resume() } }
  func applicationWillTerminate(_ notification: Notification) {
    poll?.cancel()
    NotificationCenter.default.removeObserver(self)
    NSWorkspace.shared.notificationCenter.removeObserver(self)
  }
  func application(
    _ application: NSApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) { ChatModel.shared.pushStatus = "APNs 注册成功" }
  func application(
    _ application: NSApplication, didFailToRegisterForRemoteNotificationsWithError error: Error
  ) { ChatModel.shared.pushStatus = error.localizedDescription }
  func application(
    _ application: NSApplication, didReceiveRemoteNotification userInfo: [String: Any]
  ) { Task { await ChatModel.shared.resume() } }
  nonisolated func userNotificationCenter(
    _ center: UNUserNotificationCenter, willPresent notification: UNNotification
  ) async -> UNNotificationPresentationOptions { [.banner, .list, .sound] }
  nonisolated func userNotificationCenter(
    _ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping @Sendable () -> Void
  ) {
    let id = ChatNotification.messageID(from: response.notification.request.content.userInfo)
    Task { @MainActor in
      completionHandler()
      NSApplication.shared.activate(ignoringOtherApps: true)
      ChatModel.shared.openNotification(id)
    }
  }
}
