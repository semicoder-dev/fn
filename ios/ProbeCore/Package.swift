// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "FnProbeCore",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [.library(name: "FnProbeCore", targets: ["FnProbeCore"])],
    targets: [.target(name: "FnProbeCore"), .testTarget(name: "FnProbeCoreTests", dependencies: ["FnProbeCore"])]
)
