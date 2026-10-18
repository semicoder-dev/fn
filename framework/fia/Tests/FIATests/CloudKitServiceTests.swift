import CloudKit
import XCTest
@testable import FIA

@MainActor
final class CloudKitServiceTests: XCTestCase {
    func testSystemFieldsRoundTripAndIdentityBinding() throws {
        let zone = CKRecordZone.ID(zoneName: "test")
        let record = CKRecord(recordType: "Message", recordID: .init(recordName: "message", zoneID: zone))
        record["payload"] = "{\"version\":1}" as CKRecordValue
        let encoded = try CloudKitService.encode(record)
        let restored = try CloudKitService.decode(encoded, zone: zone)
        XCTAssertEqual(restored.recordID, record.recordID)
        XCTAssertEqual(restored["payload"] as? String, "{\"version\":1}")
        XCTAssertThrowsError(try CloudKitService.decode(encoded, zone: .init(zoneName: "other")))
        XCTAssertThrowsError(try CloudKitService.decode(.init(id: "other", type: encoded.type, fields: encoded.fields, systemFields: encoded.systemFields), zone: zone))
    }
    func testOversizeAndUnsupportedFieldsFailBeforeTransport() throws {
        let zone = CKRecordZone.ID(zoneName: "test")
        XCTAssertThrowsError(try CloudKitService.decode(.init(id: "a", type: "Message", fields: ["payload": String(repeating: "x", count: 65537)], systemFields: nil), zone: zone))
        let record = CKRecord(recordType: "Message", recordID: .init(recordName: "a", zoneID: zone))
        record["number"] = 1 as CKRecordValue
        XCTAssertThrowsError(try CloudKitService.encode(record))
    }
    func testUnconfiguredContainerFailsWithoutStartingCloudKit() async throws {
        let registry = NativeMethodRegistry()
        let service = CloudKitService(containers: [])
        service.register(in: registry)
        let result = await registry.dispatch(method: "cloudKit.account", params: Data("{\"container\":\"iCloud.invalid\"}".utf8))
        switch result {
        case .success: XCTFail("Unconfigured container must not be opened")
        case .failure(let error): XCTAssertEqual((error as? FIAError)?.code, .capabilityUnavailable)
        }
    }
}
