import AppKit

@MainActor
protocol CodeUpdateFeedback: AnyObject {
  var isVisible: Bool { get }
  func show()
  func hide()
  func render(_ state: CodeUpdateState, current: CodeRelease, chinese: Bool, installed: Bool)
}

/// A modeless status window keeps network work off AppKit's modal event loop.
@MainActor
final class CodeUpdateWindow: NSObject, CodeUpdateFeedback, NSWindowDelegate {
  let window: NSPanel
  let heading = NSTextField(wrappingLabelWithString: "")
  let detail = NSTextField(wrappingLabelWithString: "")
  let progress = NSProgressIndicator()
  let action = NSButton(title: "", target: nil, action: nil)
  let dismiss = NSButton(title: "", target: nil, action: nil)
  var onRetry: (() -> Void)?
  var onDownloadInstaller: ((URL) -> Void)?
  private var downloadURL: URL?
  var isVisible: Bool { window.isVisible }

  override init() {
    window = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 440, height: 240),
      styleMask: [.titled, .closable], backing: .buffered, defer: false)
    super.init()
    window.isReleasedWhenClosed = false
    window.hidesOnDeactivate = false
    window.delegate = self
    window.center()
    heading.font = .boldSystemFont(ofSize: 17)
    heading.preferredMaxLayoutWidth = 392
    detail.font = .systemFont(ofSize: 13)
    detail.preferredMaxLayoutWidth = 392
    detail.textColor = .secondaryLabelColor
    detail.isSelectable = true
    progress.style = .spinning
    progress.controlSize = .small
    progress.isDisplayedWhenStopped = false
    action.bezelStyle = .rounded
    action.target = self
    action.action = #selector(performAction)
    dismiss.bezelStyle = .rounded
    dismiss.target = self
    dismiss.action = #selector(closeWindow)
    dismiss.keyEquivalent = "\u{1b}"
    let spacer = NSView()
    spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
    let buttons = NSStackView(views: [spacer, action, dismiss])
    buttons.orientation = .horizontal
    buttons.spacing = 8
    let content = NSStackView(views: [heading, detail, progress, buttons])
    content.orientation = .vertical
    content.alignment = .leading
    content.spacing = 16
    content.translatesAutoresizingMaskIntoConstraints = false
    let root = window.contentView!
    root.addSubview(content)
    NSLayoutConstraint.activate([
      content.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 24),
      content.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -24),
      content.topAnchor.constraint(equalTo: root.topAnchor, constant: 24),
      content.bottomAnchor.constraint(lessThanOrEqualTo: root.bottomAnchor, constant: -24),
      heading.widthAnchor.constraint(equalTo: content.widthAnchor),
      detail.widthAnchor.constraint(equalTo: content.widthAnchor),
      buttons.widthAnchor.constraint(equalTo: content.widthAnchor),
    ])
  }

  func show() { window.makeKeyAndOrderFront(nil) }
  func hide() { window.orderOut(nil) }
  @objc private func closeWindow() { hide() }
  @objc private func performAction() {
    if let downloadURL { onDownloadInstaller?(downloadURL) }
    else { onRetry?() }
  }

  func render(_ state: CodeUpdateState, current: CodeRelease, chinese: Bool, installed: Bool) {
    func text(_ zh: String, _ en: String) -> String { chinese ? zh : en }
    window.title = text("软件更新", "Software Update")
    let version = "\(current.version) (\(current.build))"
    let running = ["checking", "downloading", "applying"].contains(state.phase)
    dismiss.title = running ? text("在后台继续", "Continue in Background") : text("关闭", "Close")
    action.isHidden = true
    action.keyEquivalent = ""
    downloadURL = nil
    progress.isHidden = !running
    if running { progress.startAnimation(nil) } else { progress.stopAnimation(nil) }
    switch state.phase {
    case "checking":
      heading.stringValue = text("正在检查更新…", "Checking for updates…")
      detail.stringValue = text("当前版本：", "Current version: ") + version
    case "downloading":
      heading.stringValue = text("正在下载更新…", "Downloading update…")
      detail.stringValue = text("正在下载并验证版本 ", "Downloading and verifying version ") + (state.version ?? "")
    case "applying":
      heading.stringValue = text("正在应用更新…", "Applying update…")
      detail.stringValue = text("后台将重新启动，页面将刷新。请稍候。", "The background service will restart and the interface will reload. Please wait.")
    case "available", "downloaded":
      heading.stringValue = text("更新已就绪", "An update is ready")
      detail.stringValue = text("新版本：", "New version: ") + (state.version ?? "")
      action.title = text("继续更新…", "Continue Update…")
      action.isHidden = false
    case "requiresInstall":
      heading.stringValue = text("发现新版本", "A new version is available")
      detail.stringValue = text("版本 \(state.version ?? "") 包含原生组件更新，需要下载并安装新版应用。", "Version \(state.version ?? "") includes native component changes. Download and install the new application.")
      if let link = state.downloadURL, let url = URL(string: link), url.scheme == "https" {
        downloadURL = url
        action.title = text("下载安装包", "Download App")
        action.isHidden = false
      }
    case "current":
      heading.stringValue = installed ? text("更新完成", "Update complete") : text("已是最新版本", "You're up to date")
      detail.stringValue = text("当前版本：", "Current version: ") + version
      if state.message == "previous_update_failed" {
        heading.stringValue = text("正在使用上一稳定版本", "Using the previous stable version")
        detail.stringValue += text("。上次更新失败，已保留当前版本。", ". The last update failed; the current version has been kept.")
      }
    case "failed":
      heading.stringValue = text("更新未完成", "Update could not complete")
      detail.stringValue = state.message == "update_busy"
        ? text("应用仍有任务正在运行，请稍后重试。", "The application has tasks in progress. Please try again later.")
        : text("请稍后重试。", "Please try again later.") + "\n" + (state.message ?? "")
      action.title = text("重试", "Retry")
      action.isHidden = false
    default:
      heading.stringValue = text("此版本未启用在线更新", "Online updates are not enabled")
      detail.stringValue = text("当前版本：", "Current version: ") + version
    }
    if state.phase == "downloaded", let message = state.message {
      heading.stringValue = text("暂时无法更新", "Update postponed")
      detail.stringValue = message == "update_busy"
        ? text("应用仍有任务正在运行。更新已下载，可稍后重试。", "The application has tasks in progress. The update is downloaded; try again later.")
        : message
    }
    if !action.isHidden { action.keyEquivalent = "\r" }
    let height = max(180, 48 + heading.fittingSize.height + detail.fittingSize.height + 32 + (running ? 64 : 32))
    window.setContentSize(NSSize(width: 440, height: height))
  }
}
