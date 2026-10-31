import AppKit
import Foundation

public enum FIAApplication {
    /// Schedule outside a main-dispatch callback: AppKit's terminateLater loop must
    /// remain able to service the main queue while asynchronous cleanup runs.
    @MainActor
    public static func requestQuit() {
        RunLoop.main.perform(inModes: [.common]) {
            MainActor.assumeIsolated { NSApp.terminate(nil) }
        }
        CFRunLoopWakeUp(CFRunLoopGetMain())
    }

    @MainActor
    public static func run() {
        do {
            if CommandLine.arguments.dropFirst().first == "--cli" { try AgentCLI.run() }
            if CommandLine.arguments.dropFirst().first == "icon" {
                try renderIcon(arguments: [CommandLine.arguments[0]] + Array(CommandLine.arguments.dropFirst(2)))
                return
            }
            if CommandLine.arguments.dropFirst().first == "icon-badge" {
                try renderBadgedIcon(arguments: Array(CommandLine.arguments.dropFirst(2)))
                return
            }
            let manifest = try RuntimeManifest.load()
            let runtime = try FIARuntime(manifest: manifest)
            let application = NSApplication.shared
            let headless = CommandLine.arguments.contains("--agent-background")
            let delegate = ApplicationDelegate(runtime: runtime, manifest: manifest, headless: headless)
            application.delegate = delegate
            application.setActivationPolicy(headless ? .accessory : .regular)
            application.run()
            withExtendedLifetime(delegate) {}
        } catch {
            if CommandLine.arguments.contains("--agent-background") { AgentCLI.recordStartupFailure(error) }
            fputs("FIA: " + error.localizedDescription + "\n", stderr)
            exit(1)
        }
    }
}

@MainActor
final class ApplicationDelegate: NSObject, NSApplicationDelegate {
    private let runtime: FIARuntime
    private let manifest: RuntimeManifest
    private var headless: Bool
    private(set) var statusItem: NSStatusItem?
    private var stopping = false
    private var menuInstalled = false
    private var menuLocale: String?
    private var chinese: Bool { runtime.statusMenu.locale?.hasPrefix("zh") ?? false }

    init(runtime: FIARuntime, manifest: RuntimeManifest, headless: Bool) {
        self.runtime = runtime
        self.manifest = manifest
        self.headless = headless
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        runtime.onShow = { [weak self] in self?.showApplication() }
        runtime.onStatusMenu = { [weak self] in
            guard let self else { return }
            self.installStatusItem()
            if self.menuLocale != self.runtime.statusMenu.locale {
                self.menuLocale = self.runtime.statusMenu.locale
                self.runtime.windows.locale = self.menuLocale ?? "en"
                self.menuInstalled = false
                self.installMenu()
            }
        }
        installStatusItem()
        if !headless { installMenu() }
        Task { @MainActor in
            do {
                try await runtime.start(background: headless)
                AgentCLI.clearStartupFailure(identifier: manifest.app.identifier)
                if !headless { NSApp.activate(ignoringOtherApps: true) }
            } catch {
                AgentCLI.recordStartupFailure(error)
                if headless { fputs("FIA startup: \(error.localizedDescription)\n", stderr); NSApp.terminate(nil) }
                else { NSAlert(error: error).runModal() }
            }
        }
    }

    func application(_ application: NSApplication, didRegisterForRemoteNotificationsWithDeviceToken token: Data) {
        runtime.cloudKit.registeredPush()
    }
    func application(_ application: NSApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        runtime.cloudKit.registeredPush(error: error)
    }
    func application(_ application: NSApplication, didReceiveRemoteNotification userInfo: [String: Any]) {
        runtime.cloudKit.receivedPush(userInfo)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        false
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        guard !stopping else { return .terminateLater }
        stopping = true
        Task { @MainActor in
            let report = await runtime.stop()
            sender.reply(toApplicationShouldTerminate: report.completed)
            if !report.completed {
                stopping = false
                let message = report.issues.map(\.message).joined(separator: "\n")
                if headless { fputs("FIA shutdown: \(message)\n", stderr) }
                else { NSAlert(error: ManagedProcessError(message)).runModal() }
            }
        }
        return .terminateLater
    }

    func installMenu() {
        guard !headless, !menuInstalled else { return }
        menuInstalled = true
        let main = NSMenu()
        let applicationItem = NSMenuItem(title: manifest.app.name, action: nil, keyEquivalent: "")
        let applicationMenu = NSMenu()
        applicationMenu.addItem(withTitle: chinese ? "关于 \(manifest.app.name)" : "About \(manifest.app.name)", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        if runtime.updater.isEnabled {
            applicationMenu.addItem(.separator())
            let update = NSMenuItem(title: chinese ? "检查更新…" : "Check for Updates…", action: #selector(checkForUpdates), keyEquivalent: "")
            update.target = self
            applicationMenu.addItem(update)
        }
        let install = NSMenuItem(title: chinese ? "安装命令行工具…" : "Install Command Line Tool…", action: #selector(installCLI), keyEquivalent: "")
        install.target = self
        applicationMenu.addItem(install)
        let disconnect = NSMenuItem(title: chinese ? "断开浏览器连接" : "Disconnect Browser Connections", action: #selector(disconnectBrowsers), keyEquivalent: "")
        disconnect.target = self
        applicationMenu.addItem(disconnect)
        applicationMenu.addItem(.separator())
        applicationMenu.addItem(withTitle: chinese ? "隐藏 \(manifest.app.name)" : "Hide \(manifest.app.name)", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let hideOthers = applicationMenu.addItem(withTitle: chinese ? "隐藏其他" : "Hide Others", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        hideOthers.keyEquivalentModifierMask = [.command, .option]
        applicationMenu.addItem(withTitle: chinese ? "全部显示" : "Show All", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        applicationMenu.addItem(.separator())
        applicationMenu.addItem(withTitle: chinese ? "退出 \(manifest.app.name)" : "Quit \(manifest.app.name)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        applicationItem.submenu = applicationMenu
        main.addItem(applicationItem)

        let fileItem = NSMenuItem(title: chinese ? "文件" : "File", action: nil, keyEquivalent: "")
        let fileMenu = NSMenu(title: chinese ? "文件" : "File")
        fileMenu.addItem(withTitle: chinese ? "关闭窗口" : "Close Window", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        fileItem.submenu = fileMenu
        main.addItem(fileItem)

        let editItem = NSMenuItem(title: chinese ? "编辑" : "Edit", action: nil, keyEquivalent: "")
        let editMenu = NSMenu(title: chinese ? "编辑" : "Edit")
        editMenu.addItem(withTitle: chinese ? "撤销" : "Undo", action: Selector(("undo:")), keyEquivalent: "z")
        editMenu.addItem(withTitle: chinese ? "重做" : "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
        editMenu.addItem(.separator())
        editMenu.addItem(withTitle: chinese ? "剪切" : "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: chinese ? "复制" : "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: chinese ? "粘贴" : "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: chinese ? "全选" : "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editItem.submenu = editMenu
        main.addItem(editItem)

        let windowItem = NSMenuItem(title: chinese ? "窗口" : "Window", action: nil, keyEquivalent: "")
        let windowMenu = NSMenu(title: chinese ? "窗口" : "Window")
        windowMenu.addItem(withTitle: chinese ? "最小化" : "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: chinese ? "缩放" : "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        windowMenu.addItem(.separator())
        windowMenu.addItem(withTitle: chinese ? "全部置前" : "Bring All to Front", action: #selector(NSApplication.arrangeInFront(_:)), keyEquivalent: "")
        windowItem.submenu = windowMenu
        main.addItem(windowItem)
        NSApp.windowsMenu = windowMenu
        NSApp.mainMenu = main
    }

    func installStatusItem() {
        guard let configuration = manifest.statusItem else { return }
        let item = statusItem ?? NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.image = NSImage(systemSymbolName: configuration.symbol, accessibilityDescription: configuration.tooltip)
        item.button?.toolTip = configuration.tooltip
        if let profile = manifest.localProfile {
            item.button?.title = " " + profile.label
            item.button?.font = NSFont.monospacedSystemFont(ofSize: 10, weight: .bold)
            item.button?.toolTip = manifest.app.name + " — " + (configuration.tooltip ?? manifest.app.name)
        }
        let menu = NSMenu()
        for entry in runtime.statusMenu.items {
            let row = NSMenuItem(title: entry.label, action: #selector(applicationMenuAction(_:)), keyEquivalent: "")
            row.target = self; row.representedObject = entry.id; row.isEnabled = entry.enabled != false
            row.state = entry.checked == true ? .on : .off; menu.addItem(row)
        }
        if !runtime.statusMenu.items.isEmpty { menu.addItem(.separator()) }
        let show = NSMenuItem(title: chinese ? "显示桌面" : "Show Desktop", action: #selector(showMainWindow), keyEquivalent: "")
        if manifest.localProfile != nil { show.title = "Show " + manifest.app.name }
        show.target = self
        menu.addItem(show)
        let install = NSMenuItem(title: chinese ? "安装命令行工具…" : "Install Command Line Tool…", action: #selector(installCLI), keyEquivalent: "")
        install.target = self
        menu.addItem(install)
        let disconnect = NSMenuItem(title: chinese ? "断开浏览器连接" : "Disconnect Browser Connections", action: #selector(disconnectBrowsers), keyEquivalent: "")
        disconnect.target = self
        menu.addItem(disconnect)
        menu.addItem(.separator())
        menu.addItem(withTitle: chinese ? "退出" : "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        item.menu = menu
        statusItem = item
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        guard runtime.lifecycle == .running else { return false }
        showApplication()
        return false
    }

    private func showApplication() {
        headless = false
        NSApp.setActivationPolicy(.regular)
        installMenu()
        try? runtime.presentMainWindow()
        NSApp.activate(ignoringOtherApps: true)
    }
    @objc private func applicationMenuAction(_ sender: NSMenuItem) {
        if let id = sender.representedObject as? String { runtime.statusMenuAction(id) }
    }
    @objc private func showMainWindow() { showApplication() }
    @objc private func installCLI() {
        Task { @MainActor in
            do {
                let result = try await runtime.manageCLI("install")
                let alert = NSAlert(); alert.messageText = chinese ? "命令已安装" : "Command installed"
                alert.informativeText = result.pathHint ?? result.path
                alert.runModal()
            } catch { NSAlert(error: error).runModal() }
        }
    }
    @objc private func disconnectBrowsers() {
        Task { @MainActor in
            do { try await runtime.disconnectBrowsers() }
            catch { NSAlert(error: error).runModal() }
        }
    }
    @objc private func checkForUpdates() { Task { await runtime.updater.checkAndPrompt() } }
}
