// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "FIACloudKit",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [.library(name: "FIACloudKit", targets: ["FIACloudKit"])],
    targets: [
        .target(name: "FIACloudKit"),
        .testTarget(name: "FIACloudKitTests", dependencies: ["FIACloudKit"]),
    ]
)
