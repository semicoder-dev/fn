import FIAMacOS
import Foundation

public struct ChildProcessOptions: Codable, Sendable {
  public let id: String
  public let executable: String
  public let arguments: [String]
  public let directory: String
  public let environment: [String: String]
}
public struct ChildProcessID: Codable, Sendable { public let id: String }
public struct ChildProcessState: Codable, Sendable {
  public let id: String
  public let pid: Int32
  public let running: Bool
  public let exitCode: Int32?
}

/// Owned process groups, accessible only through the backend runtime channel.
@MainActor
public final class ChildProcessService {
  private var children: [String: ManagedProcess] = [:]
  var onExit: ((ChildProcessState) -> Void)?
  func state(_ id: String) throws -> ChildProcessState {
    guard let child = children[id] else {
      throw FIAError(code: .notFound, component: "processes", message: "Unknown process")
    }
    return ChildProcessState(
      id: id, pid: child.processIdentifier, running: child.isRunning,
      exitCode: child.terminationStatus)
  }
  func spawn(_ input: ChildProcessOptions) throws -> ChildProcessState {
    guard input.id.range(of: "^[A-Za-z0-9_-]{1,120}$", options: .regularExpression) != nil,
      input.executable.hasPrefix("/"), input.directory.hasPrefix("/"), children[input.id] == nil
    else {
      throw FIAError(
        code: .invalidArgument, component: "processes", message: "Invalid or duplicate process")
    }
    guard children.count < 64 else {
      throw FIAError(code: .resourceLimit, component: "processes", message: "Process limit reached")
    }
    let process = ManagedProcess(
      executable: URL(fileURLWithPath: input.executable), arguments: input.arguments,
      workingDirectory: URL(fileURLWithPath: input.directory), environment: input.environment)
    process.onExit = { [weak self] _ in
      guard let self, let state = try? self.state(input.id) else { return }
      self.onExit?(state)
    }
    try process.start()
    children[input.id] = process
    return try state(input.id)
  }
  func stop(_ id: String) async throws {
    guard let process = children[id] else { return }
    // The application may acknowledge shutdown just before its process exits.
    // Allow the exit/reap transition to settle before inspecting or signalling
    // a group whose leader is disappearing.
    try await process.stop(
      policy: .init(graceful: .milliseconds(100), terminate: .seconds(2), kill: .seconds(2)))
    children.removeValue(forKey: id)
  }
  var identifiers: [String] { Array(children.keys) }
  func stop(_ ids: [String]) async throws {
    var failure: Error?
    for id in ids {
      do { try await stop(id) } catch { failure = failure ?? error }
    }
    if let failure { throw failure }
  }
  func stopAll() async throws {
    try await stop(identifiers)
  }
  func register(in registry: NativeMethodRegistry) {
    registry.register(
      "runtime.processes.spawn", input: ChildProcessOptions.self, output: ChildProcessState.self
    ) { [weak self] input in
      try await MainActor.run {
        guard let self else { throw CancellationError() }
        return try self.spawn(input)
      }
    }
    registry.register(
      "runtime.processes.state", input: ChildProcessID.self, output: ChildProcessState.self
    ) { [weak self] input in
      try await MainActor.run {
        guard let self else { throw CancellationError() }
        return try self.state(input.id)
      }
    }
    registry.register("runtime.processes.stop", input: ChildProcessID.self, output: FIAEmpty.self) {
      [weak self] input in
      try await self?.stop(input.id)
      return FIAEmpty()
    }
  }
}

public struct StatusMenuItem: Codable, Sendable {
  public let id: String
  public let label: String
  public let enabled: Bool?
  public let checked: Bool?
}
public struct StatusMenuOptions: Codable, Sendable {
  public let items: [StatusMenuItem]
  public let locale: String?
}
public struct StatusMenuAction: Codable, Sendable { let id: String }
public struct WindowCloseRequest: Codable, Sendable { let windowId: String }
