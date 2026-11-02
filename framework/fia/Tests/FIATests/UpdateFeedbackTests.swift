import AppKit
import Foundation
import Testing

@testable import FIA

private final class FeedbackURLProtocol: URLProtocol, @unchecked Sendable {
  nonisolated(unsafe) static var body: Data?
  nonisolated(unsafe) static var files: [String: Data] = [:]
  nonisolated(unsafe) static var requests = 0
  private var work: DispatchWorkItem?
  override class func canInit(with request: URLRequest) -> Bool { true }
  override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
  override func startLoading() {
    Self.requests += 1
    let body = request.url?.path == "/latest.json" ? Self.body : Self.files[request.url!.absoluteString]
    let task = DispatchWorkItem { [weak self] in
      guard let self else { return }
      let response = HTTPURLResponse(url: self.request.url!, statusCode: body == nil ? 503 : 200,
        httpVersion: "HTTP/1.1", headerFields: nil)!
      self.client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
      if let body { self.client?.urlProtocol(self, didLoad: body) }
      self.client?.urlProtocolDidFinishLoading(self)
    }
    work = task
    DispatchQueue.global().asyncAfter(deadline: .now() + 0.3, execute: task)
  }
  override func stopLoading() { work?.cancel() }
}

@MainActor
private final class RecordingUpdateFeedback: CodeUpdateFeedback {
  var isVisible = false
  var states: [CodeUpdateState] = []
  var currentBuilds: [Int] = []
  var completions: [Bool] = []
  func show() { isVisible = true }
  func hide() { isVisible = false }
  func render(_ state: CodeUpdateState, current: CodeRelease, chinese: Bool, installed: Bool) {
    states.append(state)
    currentBuilds.append(current.build)
    completions.append(installed)
  }
}

@MainActor @Suite("Manual update feedback", .serialized)
struct UpdateFeedbackTests {
  @Test func respondsBeforeNetworkAndRepeatedClicksShareOperation() async throws {
    let f = CodeReleaseTests.Fixture()
    _ = try f.write(2, at: f.factory)
    let remote = f.root.appending(path: "remote")
    _ = try f.write(1, at: remote)
    FeedbackURLProtocol.body = try Data(contentsOf: remote.appending(path: "release.json"))
    FeedbackURLProtocol.requests = 0
    defer { f.cleanup(); FeedbackURLProtocol.body = nil }
    let network = session()
    defer { network.invalidateAndCancel() }
    let manager = try manager(f, network)
    let feedback = RecordingUpdateFeedback()
    manager.feedbackFactory = { feedback }
    let operation = Task { await manager.checkAndPrompt(manual: true) }
    for _ in 0..<100 where !feedback.isVisible { try await Task.sleep(for: .milliseconds(1)) }
    #expect(feedback.isVisible)
    #expect(feedback.states.last?.phase == "checking")
    await manager.checkAndPrompt(manual: true)
    await operation.value
    #expect(FeedbackURLProtocol.requests == 1)
    #expect(manager.state.phase == "current")
    #expect(feedback.states.last?.phase == "current")
    #expect(feedback.currentBuilds.last == 2) // An older feed is not the installed version.
    #expect(!feedback.states.contains { $0.phase == "failed" })
    manager.stop()
  }

  @Test func automaticChecksStayQuietAndManualFailureCanBeRetried() async throws {
    let f = CodeReleaseTests.Fixture()
    _ = try f.write(1, at: f.factory)
    defer { f.cleanup(); FeedbackURLProtocol.body = nil }
    let network = session()
    defer { network.invalidateAndCancel() }
    let manager = try manager(f, network)
    let feedback = RecordingUpdateFeedback()
    var presentations = 0
    manager.feedbackFactory = { presentations += 1; return feedback }
    await manager.checkAndPrompt(allowPrompt: false)
    #expect(manager.state.phase == "failed")
    #expect(presentations == 0)
    await manager.checkAndPrompt(manual: true)
    #expect(feedback.isVisible)
    #expect(feedback.states.last?.phase == "failed")
    FeedbackURLProtocol.body = try Data(contentsOf: f.factory.appending(path: "release.json"))
    await manager.checkAndPrompt(manual: true)
    #expect(presentations == 1)
    #expect(feedback.states.last?.phase == "current")
    #expect(feedback.states.last?.message == nil)
    manager.stop()
  }

  @Test func statusWindowShowsResultsAndRetryWithoutBlockingTheApplication() throws {
    _ = NSApplication.shared
    let f = CodeReleaseTests.Fixture()
    defer { f.cleanup() }
    let current = try f.write(2, at: f.factory)
    let view = CodeUpdateWindow()
    defer { view.hide() }
    var retried = false
    view.onRetry = { retried = true }
    view.render(CodeUpdateState(phase: "checking"), current: current, chinese: true, installed: false)
    view.show()
    #expect(view.isVisible)
    #expect(view.heading.stringValue == "正在检查更新…")
    #expect(view.dismiss.title == "在后台继续")
    view.render(CodeUpdateState(phase: "current"), current: current, chinese: true, installed: false)
    #expect(view.heading.stringValue == "已是最新版本")
    #expect(view.detail.stringValue.contains("1.2.0 (2)"))
    view.render(CodeUpdateState(phase: "current", message: "previous_update_failed"), current: current, chinese: true, installed: false)
    #expect(view.heading.stringValue == "正在使用上一稳定版本")
    view.render(CodeUpdateState(phase: "failed", message: "Network unavailable"), current: current, chinese: true, installed: false)
    #expect(!view.action.isHidden)
    NSApp.sendAction(view.action.action!, to: view.action.target, from: view.action)
    #expect(retried)
    view.render(CodeUpdateState(phase: "current"), current: current, chinese: false, installed: true)
    #expect(view.heading.stringValue == "Update complete")
    NSApp.sendAction(view.dismiss.action!, to: view.dismiss.target, from: view.dismiss)
    #expect(!view.isVisible)
  }

  @Test func backgroundDownloadWaitsForUserAndBusyRetryKeepsVerifiedCandidate() async throws {
    let f = CodeReleaseTests.Fixture()
    _ = try f.write(1, at: f.factory)
    let remote = f.root.appending(path: "remote")
    let candidate = try f.write(2, at: remote)
    FeedbackURLProtocol.body = try Data(contentsOf: remote.appending(path: "release.json"))
    for file in candidate.files {
      FeedbackURLProtocol.files[candidate.baseURL + file.path] = try Data(contentsOf: remote.appending(path: file.path))
    }
    defer { f.cleanup(); FeedbackURLProtocol.body = nil; FeedbackURLProtocol.files = [:] }
    let network = session()
    defer { network.invalidateAndCancel() }
    let store = try f.store()
    let manager = CodeUpdateManager(config: UpdateConfiguration(url: "https://example.com/latest.json", publicKey: f.publicKey, downloadURL: nil), store: store, network: network)
    let feedback = RecordingUpdateFeedback()
    manager.feedbackFactory = { feedback }
    manager.activate = { _, _, _ in }
    var confirmations = 0
    manager.confirmInstallation = { _ in confirmations += 1; return true }
    let operation = Task { await manager.checkAndPrompt(manual: true) }
    for _ in 0..<100 where !feedback.isVisible { try await Task.sleep(for: .milliseconds(1)) }
    #expect(feedback.isVisible)
    feedback.hide()
    await operation.value
    #expect(confirmations == 0)
    #expect(feedback.states.contains { $0.phase == "downloading" })
    #expect(manager.state.phase == "downloaded")
    #expect(!feedback.isVisible)
    manager.prepare = { throw UpdateError("update_busy") }
    await manager.checkAndPrompt(manual: true)
    #expect(manager.state.phase == "downloaded")
    #expect(feedback.states.last?.message == "update_busy")
    #expect(try store.selected().release.build == 1)
    manager.prepare = nil
    await manager.checkAndPrompt(manual: true)
    for _ in 0..<100 where manager.state.phase == "applying" { try await Task.sleep(for: .milliseconds(10)) }
    #expect(manager.state.phase == "current")
    #expect(feedback.currentBuilds.last == 2)
    #expect(feedback.completions.last == true)
    #expect(try store.selected().release.build == 2)
    manager.stop()
  }

  private func session() -> URLSession {
    let configuration = URLSessionConfiguration.ephemeral
    configuration.protocolClasses = [FeedbackURLProtocol.self]
    return URLSession(configuration: configuration)
  }
  private func manager(_ f: CodeReleaseTests.Fixture, _ network: URLSession) throws -> CodeUpdateManager {
    CodeUpdateManager(config: UpdateConfiguration(url: "https://example.com/latest.json", publicKey: f.publicKey, downloadURL: nil), store: try f.store(), network: network)
  }
}
