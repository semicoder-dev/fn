import CryptoKit
import Foundation

public struct ProbeMessage: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public let source: String
    public let text: String
    public let createdAt: Date

    public init(id: String = UUID().uuidString, source: String, text: String, createdAt: Date = .now) {
        self.id = id; self.source = source; self.text = text; self.createdAt = createdAt
    }
}

/// Disposable stage-one probe journal, not the production communication database.
public struct ProbeJournal: Codable, Sendable {
    public var messages: [String: ProbeMessage] = [:]
    public var outbox: [String: ProbeMessage] = [:]
    public var cursor: Data?
    public var hasSynced = false

    public init() {}

    public mutating func enqueue(_ message: ProbeMessage) {
        messages[message.id] = message
        outbox[message.id] = message
    }

    public mutating func acknowledge(_ id: String) { outbox.removeValue(forKey: id) }

    public mutating func apply(messages incoming: [ProbeMessage], deleted: [String], cursor: Data, reset: Bool) {
        if reset { messages = outbox }
        for id in deleted { messages.removeValue(forKey: id) }
        for message in incoming { messages[message.id] = message }
        self.cursor = cursor
        hasSynced = true
    }

    public static func accountFile(root: URL, container: String, account: String) -> URL {
        let key = Data("\(container.count):\(container)\(account)".utf8)
        let digest = SHA256.hash(data: key).map { String(format: "%02x", $0) }.joined()
        return root.appendingPathComponent(digest).appendingPathExtension("json")
    }

    public static func load(from file: URL) throws -> Self {
        guard FileManager.default.fileExists(atPath: file.path) else { return .init() }
        return try JSONDecoder().decode(Self.self, from: Data(contentsOf: file))
    }

    public func save(to file: URL) throws {
        try FileManager.default.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true,
                                                attributes: [.posixPermissions: 0o700])
        try JSONEncoder().encode(self).write(to: file, options: [.atomic])
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
    }
}
