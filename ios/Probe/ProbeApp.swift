import CloudKit
import SwiftUI
import UserNotifications

@main
struct ProbeApp: App {
    #if os(iOS)
    @UIApplicationDelegateAdaptor(ProbeDelegate.self) private var delegate
    #else
    @NSApplicationDelegateAdaptor(ProbeDelegate.self) private var delegate
    #endif
    @StateObject private var model = ProbeModel.shared
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                List {
                    Section("开发链路验证 · 非正式收件箱") {
                        Text(model.containerID).font(.caption).textSelection(.enabled)
                        Text(model.status)
                        Text(model.pushStatus).font(.caption)
                        Text(model.notificationStatus).font(.caption)
                        Text("待发送 \(model.pending) 条 · 应用收到推送 \(model.receivedPushes) 次")
                        if let date = model.lastSync { Text("最近同步：\(date.formatted())").font(.caption) }
                        Button("连接 iCloud") { Task { await model.connect() } }.disabled(model.busy)
                        Button("允许系统通知") { Task { await model.requestNotificationPermission() } }
                        Button("立即同步") { Task { await model.sync() } }.disabled(model.busy || !model.connected)
                    }
                    Section("发送验证消息") {
                        TextField("设备显示名称", text: $model.sourceName)
                        TextField("仅输入测试内容", text: $model.text, axis: .vertical)
                        Button("保存并发送") { Task { await model.send() } }.disabled(model.busy || !model.connected)
                    }
                    Section("共享验证记录") {
                        ForEach(model.messages) { message in
                            VStack(alignment: .leading, spacing: 5) {
                                Text(message.text)
                                Text(message.source).font(.caption).foregroundStyle(.secondary)
                                Text(message.createdAt.formatted()).font(.caption2).foregroundStyle(.secondary)
                                Text(message.id).font(.caption2).textSelection(.enabled)
                            }
                        }
                    }
                }
                .navigationTitle("fn CloudKit Probe")
            }
            #if os(macOS)
            .frame(minWidth: 520, minHeight: 620)
            #endif
            .onReceive(NotificationCenter.default.publisher(for: .CKAccountChanged)) { _ in model.accountChanged() }
            .onChange(of: scenePhase) { _, phase in
                if phase == .active { Task { await model.resume() } }
            }
            #if os(macOS)
            .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.didWakeNotification,
                                                           object: nil)) { _ in Task { await model.sync() } }
            .task {
                while !Task.isCancelled {
                    do { try await Task.sleep(for: .seconds(60)) } catch { break }
                    await model.sync()
                }
            }
            #endif
        }
    }
}

@MainActor
final class ProbeDelegate: NSObject, UNUserNotificationCenterDelegate {
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter,
                                            willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        [.banner, .sound, .list]
    }

    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter,
                                            didReceive response: UNNotificationResponse) async {
        await ProbeModel.shared.resume()
    }
}

#if os(iOS)
import UIKit
extension ProbeDelegate: UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        application.registerForRemoteNotifications()
        Task { await ProbeModel.shared.resume() }
        return true
    }
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        ProbeModel.shared.pushStatus = "APNs 注册成功"
    }
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        ProbeModel.shared.pushStatus = "APNs 注册失败：\(error.localizedDescription)"
    }
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completion: @escaping (UIBackgroundFetchResult) -> Void) {
        Task { completion(await ProbeModel.shared.receivedPush() ? .newData : .noData) }
    }
}
#else
import AppKit
extension ProbeDelegate: NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        UNUserNotificationCenter.current().delegate = self
        NSApplication.shared.registerForRemoteNotifications()
        Task { await ProbeModel.shared.resume() }
    }
    func application(_ application: NSApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        ProbeModel.shared.pushStatus = "APNs 注册成功"
    }
    func application(_ application: NSApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        ProbeModel.shared.pushStatus = "APNs 注册失败：\(error.localizedDescription)"
    }
    func application(_ application: NSApplication, didReceiveRemoteNotification userInfo: [String: Any]) {
        Task { await ProbeModel.shared.receivedPush() }
    }
}
#endif
