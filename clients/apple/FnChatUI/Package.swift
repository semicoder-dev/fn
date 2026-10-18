// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "FnChatUI", platforms: [.iOS(.v17), .macOS(.v14)],
  products: [.library(name: "FnChatUI", targets: ["FnChatUI"])],
  dependencies: [.package(path: "../FnChatCore")],
  targets: [
    .target(name: "FnChatUI", dependencies: [.product(name: "FnChatCore", package: "FnChatCore")])
  ])
