import Foundation
import Testing
@testable import FnProbeCore

struct ProbeJournalTests {
    @Test func outboxAndIDSurviveRestart() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let file = ProbeJournal.accountFile(root: root, container: "dev", account: "a")
        var journal = ProbeJournal()
        let message = ProbeMessage(source: "mac", text: "test")
        journal.enqueue(message)
        try journal.save(to: file)
        var reopened = try ProbeJournal.load(from: file)
        #expect(reopened.outbox[message.id] == message)
        reopened.acknowledge(message.id)
        try reopened.save(to: file)
        #expect(try ProbeJournal.load(from: file).outbox.isEmpty)
        #expect(try ProbeJournal.load(from: file).messages[message.id] == message)
    }

    @Test func expiredCursorRebuildPreservesPendingButDropsStaleRemoteRecords() {
        var journal = ProbeJournal()
        let pending = ProbeMessage(source: "mac", text: "pending")
        let old = ProbeMessage(source: "phone", text: "old")
        journal.enqueue(pending)
        journal.apply(messages: [old], deleted: [], cursor: Data([1]), reset: false)
        journal.apply(messages: [], deleted: [], cursor: Data([2]), reset: true)
        #expect(journal.messages[old.id] == nil)
        #expect(journal.messages[pending.id] == pending)
        #expect(journal.outbox[pending.id] == pending)
        #expect(journal.cursor == Data([2]))
    }

    @Test func accountAndEnvironmentKeysAreIsolated() {
        let root = URL(fileURLWithPath: "/tmp/probe")
        let a = ProbeJournal.accountFile(root: root, container: "dev", account: "a")
        #expect(a != ProbeJournal.accountFile(root: root, container: "dev", account: "b"))
        #expect(a != ProbeJournal.accountFile(root: root, container: "prod", account: "a"))
    }

    @Test func corruptJournalIsNotSilentlyReplaced() throws {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: file) }
        try Data("broken".utf8).write(to: file)
        #expect(throws: (any Error).self) { try ProbeJournal.load(from: file) }
        #expect(try String(contentsOf: file, encoding: .utf8) == "broken")
    }
}
