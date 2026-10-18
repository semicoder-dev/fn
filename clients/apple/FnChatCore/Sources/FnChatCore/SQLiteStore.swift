import CSQLite
import CryptoKit
import Foundation

public struct ChatRecord: Codable, Sendable, Equatable {
  public let id: String
  public let type: String
  public let payload: String
  public let systemFields: Data?
  public init(id: String, type: String, payload: String, systemFields: Data? = nil) {
    self.id = id
    self.type = type
    self.payload = payload
    self.systemFields = systemFields
  }
}
public struct PendingIntent: Codable, Sendable {
  public let id: String
  public let kind: String
  public let payload: String
}
public struct SQLiteFailure: Error, LocalizedError {
  public let message: String
  public init(message: String) { self.message = message }
  public var errorDescription: String? { message }
}

/// MainActor serializes transactions with UI mutations. Each account/environment owns one file.
@MainActor
public final class SQLiteStore {
  private final class Handle: @unchecked Sendable {
    let value: OpaquePointer
    init(_ value: OpaquePointer) { self.value = value }
    deinit { sqlite3_close(value) }
  }
  private let handle: Handle
  private var database: OpaquePointer { handle.value }
  public let deviceId: String
  public static func accountFile(root: URL, environment: String, container: String, account: String)
    throws -> URL
  {
    let data = try JSONEncoder().encode(["chat-v2", environment, container, account])
    let name = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    let directory = root.appendingPathComponent("chat-v2").appendingPathComponent(name)
    try FileManager.default.createDirectory(
      at: directory, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
    return directory.appendingPathComponent("chat.sqlite")
  }
  public init(path: String) throws {
    var handle: OpaquePointer?
    guard
      sqlite3_open_v2(
        path, &handle, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX, nil)
        == SQLITE_OK, let handle
    else {
      if let handle { sqlite3_close(handle) }
      throw SQLiteFailure(message: "无法打开通信数据库")
    }
    self.handle = Handle(handle)
    do {
      try Self.execute(handle, "PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;")
      try Self.execute(
        handle,
        """
        CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,type TEXT NOT NULL,payload TEXT NOT NULL,system_fields TEXT);
        CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,kind TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',error TEXT,created_at INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS optimistic(outbox_id TEXT NOT NULL,record_id TEXT NOT NULL,record TEXT NOT NULL,PRIMARY KEY(outbox_id,record_id));
        CREATE TABLE IF NOT EXISTS unsupported(id TEXT PRIMARY KEY,record TEXT NOT NULL,error TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS record_types ON records(type);
        """)
      let rows = try Self.query(handle, "SELECT value FROM meta WHERE key='deviceId'")
      deviceId = rows.first?[0] ?? UUID().uuidString
      try Self.execute(handle, "INSERT OR IGNORE INTO meta VALUES ('deviceId',?)", [deviceId])
      if path != ":memory:" {
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: path)
      }
    } catch { throw error }
  }
  private static let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
  private static func statement(_ database: OpaquePointer, _ sql: String, _ arguments: [String?])
    throws -> OpaquePointer
  {
    var pointer: OpaquePointer?
    guard sqlite3_prepare_v2(database, sql, -1, &pointer, nil) == SQLITE_OK, let pointer else {
      throw SQLiteFailure(message: String(cString: sqlite3_errmsg(database)))
    }
    for (index, value) in arguments.enumerated() {
      let result: Int32
      if let value {
        result = value.withCString {
          sqlite3_bind_text(pointer, Int32(index + 1), $0, -1, transient)
        }
      } else {
        result = sqlite3_bind_null(pointer, Int32(index + 1))
      }
      if result != SQLITE_OK {
        sqlite3_finalize(pointer)
        throw SQLiteFailure(message: "无法绑定通信记录")
      }
    }
    return pointer
  }
  private static func execute(_ database: OpaquePointer, _ sql: String, _ arguments: [String?] = [])
    throws
  {
    if arguments.isEmpty {
      guard sqlite3_exec(database, sql, nil, nil, nil) == SQLITE_OK else {
        throw SQLiteFailure(message: String(cString: sqlite3_errmsg(database)))
      }
      return
    }
    let pointer = try statement(database, sql, arguments)
    defer { sqlite3_finalize(pointer) }
    guard sqlite3_step(pointer) == SQLITE_DONE else {
      throw SQLiteFailure(message: String(cString: sqlite3_errmsg(database)))
    }
  }
  private static func query(_ database: OpaquePointer, _ sql: String, _ arguments: [String?] = [])
    throws -> [[String?]]
  {
    let pointer = try statement(database, sql, arguments)
    defer { sqlite3_finalize(pointer) }
    var rows: [[String?]] = []
    while true {
      let result = sqlite3_step(pointer)
      if result == SQLITE_DONE { return rows }
      guard result == SQLITE_ROW else {
        throw SQLiteFailure(message: String(cString: sqlite3_errmsg(database)))
      }
      rows.append(
        (0..<sqlite3_column_count(pointer)).map { column in
          guard let value = sqlite3_column_text(pointer, column) else { return nil }
          return String(cString: value)
        })
    }
  }
  private func transaction(_ operation: () throws -> Void) throws {
    try Self.execute(database, "BEGIN IMMEDIATE")
    do {
      try operation()
      try Self.execute(database, "COMMIT")
    } catch {
      try? Self.execute(database, "ROLLBACK")
      throw error
    }
  }
  public func meta(_ key: String) throws -> String? {
    try Self.query(database, "SELECT value FROM meta WHERE key=?", [key]).first?[0] ?? nil
  }
  public func setMeta(_ key: String, _ value: String) throws {
    try Self.execute(database, "INSERT OR REPLACE INTO meta VALUES (?,?)", [key, value])
  }
  public func records(type: String? = nil) throws -> [ChatRecord] {
    let rows = try Self.query(
      database,
      "SELECT id,type,payload,system_fields FROM records" + (type == nil ? "" : " WHERE type=?"),
      type.map { [$0] } ?? [])
    return rows.map {
      ChatRecord(
        id: $0[0]!, type: $0[1]!, payload: $0[2]!,
        systemFields: $0[3].flatMap { Data(base64Encoded: $0) })
    }
  }
  public func record(id: String) throws -> ChatRecord? {
    guard
      let row = try Self.query(
        database, "SELECT id,type,payload,system_fields FROM records WHERE id=?", [id]
      ).first
    else { return nil }
    return ChatRecord(
      id: row[0]!, type: row[1]!, payload: row[2]!,
      systemFields: row[3].flatMap { Data(base64Encoded: $0) })
  }
  private func validate(_ record: ChatRecord) throws -> [String: Any] {
    let data = Data(record.payload.utf8)
    try Contract.validate(type: record.type, data: data)
    guard let object = try JSONSerialization.jsonObject(with: data) as? [String: Any],
      try Contract.identity(type: record.type, data: data) == record.id
    else { throw ChatError.invalidMessage }
    return object
  }
  private func put(_ record: ChatRecord, _ object: [String: Any]) throws {
    try Self.execute(
      database, "INSERT OR REPLACE INTO records VALUES (?,?,?,?)",
      [record.id, record.type, record.payload, record.systemFields?.base64EncodedString()])
  }
  public func enqueue(_ intent: PendingIntent, records: [ChatRecord] = []) throws {
    try transaction {
      guard try Self.query(database, "SELECT id FROM outbox WHERE id=?", [intent.id]).isEmpty else {
        return
      }
      for record in records {
        try put(record, validate(record))
        let serialized = String(decoding: try JSONEncoder().encode(record), as: UTF8.self)
        try Self.execute(
          database, "INSERT INTO optimistic VALUES (?,?,?)", [intent.id, record.id, serialized])
      }
      try Self.execute(
        database, "INSERT INTO outbox(id,kind,payload,created_at) VALUES (?,?,?,?)",
        [
          intent.id, intent.kind, intent.payload,
          String(Int64(Date().timeIntervalSince1970 * 1000)),
        ])
    }
  }
  public func pending() throws -> [PendingIntent] {
    try Self.query(
      database, "SELECT id,kind,payload FROM outbox WHERE status='pending' ORDER BY created_at,id"
    ).map { PendingIntent(id: $0[0]!, kind: $0[1]!, payload: $0[2]!) }
  }
  public func unsupportedCount() throws -> Int {
    Int(try Self.query(database, "SELECT count(*) FROM unsupported").first?[0] ?? "0") ?? 0
  }
  public func updateIntent(_ id: String, payload: String) throws {
    try Self.execute(database, "UPDATE outbox SET payload=? WHERE id=?", [payload, id])
  }
  public func failures() throws -> [String] {
    try Self.query(
      database, "SELECT error FROM outbox WHERE status='failed' ORDER BY created_at DESC LIMIT 20"
    ).compactMap { $0[0] }
  }
  public func failure(_ id: String) throws -> String? {
    try Self.query(database, "SELECT error FROM outbox WHERE id=? AND status='failed'", [id])
      .first?[0] ?? nil
  }
  public func fail(_ id: String, error: String) throws {
    try Self.execute(database, "UPDATE outbox SET status='failed',error=? WHERE id=?", [error, id])
  }
  public func acknowledge(_ id: String, records: [ChatRecord]) throws {
    try transaction {
      for record in records { try put(record, validate(record)) }
      try Self.execute(database, "DELETE FROM outbox WHERE id=?", [id])
      try Self.execute(database, "DELETE FROM optimistic WHERE outbox_id=?", [id])
    }
  }
  public func apply(_ records: [ChatRecord], deleted: [String], token: String, reset: Bool = false)
    throws
  {
    try transaction {
      if reset { try Self.execute(database, "DELETE FROM records") }
      for record in records {
        let object: [String: Any]
        do { object = try validate(record) } catch {
          let serialized = String(decoding: try JSONEncoder().encode(record), as: UTF8.self)
          try Self.execute(
            database, "INSERT OR REPLACE INTO unsupported VALUES (?,?,?)",
            [record.id, serialized, String(describing: error)])
          continue
        }
        try put(record, object)
        try Self.execute(database, "DELETE FROM unsupported WHERE id=?", [record.id])
      }
      for id in deleted {
        try Self.execute(database, "DELETE FROM records WHERE id=?", [id])
        try Self.execute(database, "DELETE FROM unsupported WHERE id=?", [id])
      }
      if reset {
        for row in try Self.query(
          database,
          "SELECT record FROM optimistic JOIN outbox ON outbox.id=optimistic.outbox_id WHERE outbox.status='pending'"
        ) {
          let record = try JSONDecoder().decode(ChatRecord.self, from: Data(row[0]!.utf8))
          if try self.record(id: record.id) == nil { try put(record, validate(record)) }
        }
      }
      try setMeta("cursor", token)
      try setMeta("hasSynced", "true")
    }
  }
}
