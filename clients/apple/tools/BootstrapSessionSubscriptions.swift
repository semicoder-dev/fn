import CloudKit
import Foundation

// Sign with the intended container/environment. Only creates the v3 zone and
// subscriptions; it neither reads nor changes business records or v2 resources.
@main struct BootstrapSessionSubscriptions {
  static func main() async {
    do {
      let database = CKContainer(identifier: "iCloud.com.semicoder.fn.production").privateCloudDatabase
      let zone = CKRecordZone.ID(zoneName: "fn-chat-production-v3", ownerName: CKCurrentUserDefaultName)
      _ = try await database.save(CKRecordZone(zoneID: zone))
      for id in ["fn-chat-v3-host-com.semicoder.fn-production", "fn-chat-v3-sync-com.semicoder.fn.ios-fn-chat-production-v3"] {
        let subscription = CKRecordZoneSubscription(zoneID: zone, subscriptionID: id)
        let info = CKSubscription.NotificationInfo()
        info.shouldSendContentAvailable = true
        subscription.notificationInfo = info
        _ = try await database.save(subscription)
        print("Ready: \(id)")
      }
      for (type, prefix) in [("FnSessionReply", "bots"), ("FnSessionCard", "cards")] {
        let subscription = CKQuerySubscription(recordType: type, predicate: NSPredicate(value: true), subscriptionID: "fn-chat-v3-\(prefix)-com.semicoder.fn.ios-fn-chat-production-v3", options: [.firesOnRecordCreation])
        subscription.zoneID = zone
        let info = CKSubscription.NotificationInfo()
        info.title = "fn Chat"
        info.alertBody = prefix == "cards" ? "会话有应用卡片，请打开查看。" : "会话有新内容，请打开查看。"
        info.soundName = "default"
        info.shouldSendContentAvailable = true
        subscription.notificationInfo = info
        _ = try await database.save(subscription)
        print("Ready: \(subscription.subscriptionID)")
      }
    } catch {
      fputs("Session subscription bootstrap failed: \(error)\n", stderr)
      exit(1)
    }
  }
}
