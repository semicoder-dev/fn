import CloudKit
import FnChatCore
import FnChatUI
import SwiftUI
import UserNotifications

@main struct FnPhoneApp: App {
  @UIApplicationDelegateAdaptor(PhoneDelegate.self) private var delegate
  var body: some Scene { WindowGroup { ChatRootView() } }
}
@MainActor
final class PhoneDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    UNUserNotificationCenter.current().delegate = self
    application.registerForRemoteNotifications()
    return true
  }
  func application(
    _ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data
  ) { ChatModel.shared.pushStatus = "APNs 注册成功" }
  func application(
    _ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error
  ) { ChatModel.shared.pushStatus = error.localizedDescription }
  func application(
    _ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completion: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    Task {
      await ChatModel.shared.resume()
      completion(.newData)
    }
  }
  nonisolated func userNotificationCenter(
    _ center: UNUserNotificationCenter, willPresent notification: UNNotification
  ) async -> UNNotificationPresentationOptions { [.banner, .sound, .list] }
  nonisolated func userNotificationCenter(
    _ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping @Sendable () -> Void
  ) {
    let id = ChatNotification.messageID(from: response.notification.request.content.userInfo)
    Task { @MainActor in
      completionHandler()
      ChatModel.shared.openNotification(id)
    }
  }
}
