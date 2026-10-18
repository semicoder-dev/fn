import CloudKit
import Testing
@testable import FIACloudKit

@MainActor
struct CloudKitTransportTests {
    private func record(_ name: String, zone: String = "test") -> CKRecord {
        CKRecord(recordType: "Test", recordID: .init(recordName: name, zoneID: .init(zoneName: zone)))
    }

    @Test func rejectsCrossZoneAtomicWrites() {
        #expect(throws: CloudTransportError.self) {
            try CloudKitTransport.validateBatch(saving: [record("a"), record("b", zone: "other")], deleting: [])
        }
    }

    @Test func rejectsDuplicateOrSaveAndDeleteSameRecord() {
        let item = record("same")
        #expect(throws: CloudTransportError.self) {
            try CloudKitTransport.validateBatch(saving: [item, item], deleting: [])
        }
        #expect(throws: CloudTransportError.self) {
            try CloudKitTransport.validateBatch(saving: [item], deleting: [item.recordID])
        }
    }

    @Test func acceptsRequestAndReplyInSameZone() throws {
        try CloudKitTransport.validateBatch(saving: [record("request"), record("reply")], deleting: [])
    }

    @Test func rejectsEmptyAndOversizedBatches() {
        #expect(throws: CloudTransportError.self) { try CloudKitTransport.validateBatch(saving: [], deleting: []) }
        #expect(throws: CloudTransportError.self) {
            try CloudKitTransport.validateBatch(saving: (0...200).map { record("\($0)") }, deleting: [])
        }
    }

    @Test func invalidCursorDoesNotSilentlyRestartSync() throws {
        #expect(try CloudKitTransport.decodeToken(nil) == nil)
        #expect(throws: (any Error).self) { try CloudKitTransport.decodeToken(Data("broken".utf8)) }
    }
}
