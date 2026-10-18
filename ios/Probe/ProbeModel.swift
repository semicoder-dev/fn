import CloudKit
import Combine
import FIACloudKit
import FnProbeCore
import Foundation
import UserNotifications

@MainActor
final class ProbeModel: ObservableObject {
    static let shared = ProbeModel()
    @Published var messages: [ProbeMessage] = []
    @Published var pending = 0
    @Published var status = "尚未连接 iCloud"
    @Published var pushStatus = "尚未注册推送"
    @Published var notificationStatus = "尚未请求通知权限"
    @Published var busy = false
    @Published var connected = false
    @Published var lastSync: Date?
    @Published var receivedPushes = 0
    @Published var sourceName = ""
    @Published var text = "CloudKit 双向验证"

    let containerID = Bundle.main.object(forInfoDictionaryKey: "FNCloudKitContainer") as? String ?? ""
    private let zoneName = Bundle.main.object(forInfoDictionaryKey: "FNCloudKitZone") as? String ?? ""
    private var transport: CloudKitTransport?
    private var zoneID: CKRecordZone.ID?
    private var account: String?
    private var journal = ProbeJournal()
    private var file: URL?
    private var generation = 0
    private var retryAfter = Date.distantPast
    private var syncAgain = false
    private let endpointID: String

    private init() {
        let defaults = UserDefaults.standard
        let key = "probeEndpointID"
        endpointID = defaults.string(forKey: key) ?? UUID().uuidString
        defaults.set(endpointID, forKey: key)
        #if os(iOS)
        sourceName = "iPhone"
        #else
        sourceName = "Mac"
        #endif
    }

    func accountChanged() {
        UserDefaults.standard.set(false, forKey: "probeReconnect")
        generation += 1
        connected = false; account = nil; file = nil; zoneID = nil
        journal = .init(); publish()
        status = "iCloud 账号变化；旧队列已隔离，请重新连接"
    }

    func resume() async {
        if connected { _ = await sync() }
        else if UserDefaults.standard.bool(forKey: "probeReconnect") { await connect() }
    }

    func connect() async {
        guard !busy else { return }
        guard containerID.hasPrefix("iCloud."), containerID.hasSuffix(".development"),
              zoneName == "fn-communication-probe-v1" else {
            status = "验证工程只允许独立的 .development 容器"; return
        }
        busy = true
        defer { busy = false }
        let epoch = generation
        do {
            let client = CloudKitTransport(containerIdentifier: containerID)
            status = "正在检查 iCloud 账号"
            let key = try await client.accountKey()
            try checkEpoch(epoch)
            let root = URL.applicationSupportDirectory
                .appendingPathComponent(Bundle.main.bundleIdentifier ?? "fn-probe")
                .appendingPathComponent("probe-journals")
            let path = ProbeJournal.accountFile(root: root, container: containerID, account: key)
            let loaded = try ProbeJournal.load(from: path)
            status = "正在准备开发 zone"
            let zone = try await client.ensureZone(zoneName)
            try checkEpoch(epoch)
            // A new development container has no record schema until its first save.
            // Keep one explicit diagnostic record; never initialize production schema here.
            let bootstrapID = CKRecord.ID(recordName: "fn-probe-bootstrap-v1", zoneID: zone)
            do { _ = try await client.record(bootstrapID) }
            catch let error as CKError where error.code == .unknownItem {
                try checkEpoch(epoch)
                let message = ProbeMessage(id: bootstrapID.recordName, source: "开发原型",
                                           text: "开发容器初始化（验证数据）")
                let record = CKRecord(recordType: "FnProbeMessage", recordID: bootstrapID)
                record["payload"] = String(decoding: try JSONEncoder().encode(message), as: UTF8.self) as CKRecordValue
                do { _ = try await client.commit(saving: [record]) }
                catch let conflict as CKError where conflict.code == .serverRecordChanged {
                    // Another probe initialized this user's zone concurrently.
                    _ = try await client.record(bootstrapID)
                }
            }
            try checkEpoch(epoch)
            status = "正在注册消息订阅"
            try await client.subscribeToCreations(
                id: "fn-probe-\(Bundle.main.bundleIdentifier ?? "unknown")", recordType: "FnProbeMessage",
                zoneID: zone, title: "fn 通信验证", body: "有新的验证消息，请打开应用查看。")
            try checkEpoch(epoch)
            transport = client; account = key; zoneID = zone; file = path; journal = loaded
            connected = true; retryAfter = .distantPast
            UserDefaults.standard.set(true, forKey: "probeReconnect")
            publish(); status = "已连接；正在同步"
        } catch { report(error) }
        busy = false
        if connected { _ = await sync() }
    }

    func send() async {
        guard connected, !busy, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        guard text.utf8.count <= 4096 else { status = "验证消息最多 4 KiB"; return }
        do {
            let message = ProbeMessage(source: "\(sourceName) · \(endpointID.prefix(6))", text: text)
            var next = journal
            next.enqueue(message)
            try persist(next)
            await localNotice(id: message.id, body: "本机验证消息已入队")
            _ = await sync()
        } catch { report(error) }
    }

    @discardableResult
    func sync() async -> Bool {
        if busy { syncAgain = true; return false }
        guard connected, let transport, let zoneID, let account, Date() >= retryAfter else { return false }
        busy = true
        let epoch = generation
        defer {
            busy = false
            if syncAgain {
                syncAgain = false
                Task { _ = await self.sync() }
            }
        }
        do {
            guard try await transport.accountKey() == account else {
                accountChanged(); return false
            }
            try checkEpoch(epoch)
            for message in journal.outbox.values.sorted(by: { $0.createdAt < $1.createdAt }) {
                try checkEpoch(epoch)
                let record = CKRecord(recordType: "FnProbeMessage", recordID: .init(recordName: message.id, zoneID: zoneID))
                record["payload"] = String(decoding: try JSONEncoder().encode(message), as: UTF8.self) as CKRecordValue
                do { _ = try await transport.commit(saving: [record]) }
                catch let error as CKError where error.code == .serverRecordChanged {
                    // A prior attempt may have committed but lost its response. Confirm immutable payload, then ack.
                    let existing = try await transport.record(record.recordID)
                    guard let payload = existing["payload"] as? String,
                          try JSONDecoder().decode(ProbeMessage.self, from: Data(payload.utf8)) == message
                    else { throw error }
                }
                try checkEpoch(epoch)
                var next = journal; next.acknowledge(message.id); try persist(next)
            }

            let oldIDs = Set(journal.messages.keys)
            let hadSynced = journal.hasSynced
            var reset = false
            var cursor = try CloudKitTransport.decodeToken(journal.cursor)
            var incoming: [ProbeMessage] = []
            var deleted: [String] = []
            while true {
                do {
                    let page = try await transport.changes(zoneID: zoneID, since: cursor)
                    try checkEpoch(epoch)
                    for record in page.records {
                        guard record.recordType == "FnProbeMessage" else { continue }
                        guard let payload = record["payload"] as? String else { throw ProbeError.invalidRecord }
                        let message = try JSONDecoder().decode(ProbeMessage.self, from: Data(payload.utf8))
                        guard message.id == record.recordID.recordName else { throw ProbeError.invalidRecord }
                        incoming.append(message)
                    }
                    deleted.append(contentsOf: page.deletedIDs.map(\.recordName))
                    cursor = page.token
                    if !page.moreComing { break }
                } catch let error as CKError where error.code == .changeTokenExpired && !reset {
                    reset = true; cursor = nil; incoming = []; deleted = []
                }
            }
            guard let cursor else { throw ProbeError.invalidRecord }
            try checkEpoch(epoch)
            var next = journal
            next.apply(messages: incoming, deleted: deleted, cursor: try CloudKitTransport.encodeToken(cursor), reset: reset)
            try persist(next)
            lastSync = .now; status = "同步成功"
            let newCount = Set(incoming.map(\.id)).subtracting(oldIDs).count
            if hadSynced, newCount > 1 {
                await localNotice(id: "probe-sync-summary", body: "已同步 \(newCount) 条验证消息")
            }
            return true
        } catch { if generation == epoch { report(error) }; return false }
    }

    func requestNotificationPermission() async {
        do {
            let allowed = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
            notificationStatus = allowed ? "通知已允许" : "通知未允许；可在系统设置中开启"
        } catch { notificationStatus = error.localizedDescription }
    }

    func receivedPush() async -> Bool {
        receivedPushes += 1
        if !connected { await resume() }
        return await sync()
    }

    private func localNotice(id: String, body: String) async {
        let content = UNMutableNotificationContent()
        content.title = "fn 通信验证"
        content.body = body
        content.sound = .default
        do { try await UNUserNotificationCenter.current().add(.init(identifier: "fn-probe-\(id)", content: content, trigger: nil)) }
        catch { notificationStatus = "本地提醒失败：\(error.localizedDescription)" }
    }

    private func persist(_ next: ProbeJournal) throws {
        guard let file else { throw ProbeError.accountChanged }
        try next.save(to: file)
        journal = next; publish()
    }

    private func publish() {
        messages = journal.messages.values.sorted { $0.createdAt > $1.createdAt }
        pending = journal.outbox.count
    }

    private func checkEpoch(_ epoch: Int) throws {
        guard epoch == generation else { throw ProbeError.accountChanged }
    }

    private func report(_ error: Error) {
        if let delay = (error as? CKError)?.retryAfterSeconds { retryAfter = Date().addingTimeInterval(delay) }
        status = error.localizedDescription
    }
}

enum ProbeError: Error, LocalizedError {
    case accountChanged, invalidRecord
    var errorDescription: String? {
        switch self {
        case .accountChanged: "账号已切换，请重新连接"
        case .invalidRecord: "验证记录格式不合法，同步游标未推进"
        }
    }
}
