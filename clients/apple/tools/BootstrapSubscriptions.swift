import CloudKit
import Foundation

// Sign this helper with the intended container/environment before running it.
// It creates only the v2 zone and subscriptions, never business records.
@main struct BootstrapSubscriptions {
  static func main() async {
    do {
      let database = CKContainer(identifier: "iCloud.com.semicoder.fn.production")
        .privateCloudDatabase
      let zone = CKRecordZone.ID(
        zoneName: "fn-chat-production-v2", ownerName: CKCurrentUserDefaultName)
      _ = try await database.save(CKRecordZone(zoneID: zone))
      for id in [
        "fn-chat-v2-host-com.semicoder.fn.beta-production",
        "fn-chat-v2-sync-com.semicoder.fn.ios-fn-chat-production-v2",
      ] {
        let subscription = CKRecordZoneSubscription(zoneID: zone, subscriptionID: id)
        let info = CKSubscription.NotificationInfo()
        info.shouldSendContentAvailable = true
        subscription.notificationInfo = info
        _ = try await database.save(subscription)
        print("Ready: \(id)")
      }
      let subscription = CKQuerySubscription(
        recordType: "FnChatBotMessage", predicate: NSPredicate(value: true),
        subscriptionID: "fn-chat-v2-bots-com.semicoder.fn.ios-fn-chat-production-v2",
        options: [.firesOnRecordCreation])
      subscription.zoneID = zone
      let info = CKSubscription.NotificationInfo()
      info.title = "fn Chat"
      info.alertBody = "机器人发来了新消息，请打开聊天查看。"
      info.soundName = "default"
      info.shouldSendContentAvailable = true
      subscription.notificationInfo = info
      _ = try await database.save(subscription)
      print("Ready: \(subscription.subscriptionID)")
    } catch {
      fputs("Subscription bootstrap failed: \(error)\n", stderr)
      exit(1)
    }
  }
}
