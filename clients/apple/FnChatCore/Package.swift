// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "FnChatCore", platforms: [.iOS(.v17), .macOS(.v14)],
  products: [.library(name: "FnChatCore", targets: ["FnChatCore"])],
  dependencies: [.package(path: "../../../framework/fia/native/CloudKitTransport")],
  targets: [
    .systemLibrary(name: "CSQLite"),
    .target(
      name: "FnChatCore",
      dependencies: ["CSQLite", .product(name: "FIACloudKit", package: "CloudKitTransport")],
      resources: [.process("Resources")]),
    .testTarget(name: "FnChatCoreTests", dependencies: ["FnChatCore"]),
  ])
