import CloudKit
import Foundation

public enum ChatNotification {
  public static let messageIDKey = "fnChatMessageID"

  public static func messageID(from userInfo: [AnyHashable: Any]) -> String? {
    if let id = userInfo[messageIDKey] as? String, !id.isEmpty { return id }
    return (CKNotification(fromRemoteNotificationDictionary: userInfo) as? CKQueryNotification)?
      .recordID?.recordName
  }
}
