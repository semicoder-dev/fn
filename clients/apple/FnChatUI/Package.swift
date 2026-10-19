// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "FnChatUI", platforms: [.iOS(.v17), .macOS(.v14)],
  products: [.library(name: "FnChatUI", targets: ["FnChatUI"])],
  dependencies: [
    .package(path: "../FnChatCore"),
    .package(url: "https://github.com/gonzalezreal/swift-markdown-ui", exact: "2.4.1"),
  ],
  targets: [
    .target(
      name: "FnChatUI",
      dependencies: [
        .product(name: "FnChatCore", package: "FnChatCore"),
        .product(name: "MarkdownUI", package: "swift-markdown-ui"),
      ]),
    .testTarget(name: "FnChatUITests", dependencies: ["FnChatUI"]),
  ])
