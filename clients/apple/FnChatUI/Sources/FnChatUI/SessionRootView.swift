import CloudKit
import FnChatCore
import SwiftUI

public struct SessionRootView: View {
  @StateObject private var model = SessionModel.shared
  @Environment(\.scenePhase) private var phase
  public init() {}
  public var body: some View {
    NavigationStack {
      VStack(spacing: 0) {
        if model.hosts.isEmpty {
          ContentUnavailableView {
            Label(L("connect"), systemImage: "desktopcomputer")
          } description: {
            Text(L("setup"))
          } actions: {
            Button(L("refresh")) { Task { await model.resume() } }
          }
        } else {
          HStack {
            Picker(L("devices"), selection: $model.selectedHost) {
              ForEach(model.hosts) { host in Text(host.name).tag(host.id) }
            }
            Picker(L("application"), selection: $model.selectedApplication) {
              ForEach(model.host?.applications ?? []) { app in Text(app.name).tag(app.id) }
            }
          }.padding(.horizontal).onChange(of: model.selectedHost) { _, _ in
            model.selectedApplication = model.host?.applications.first?.id ?? ""
          }
          if let host = model.host, Date().timeIntervalSince1970 * 1000 - host.updatedAt > 30000 {
            Text(L("offline")).font(.caption).foregroundStyle(.secondary).padding(10)
          } else if model.application?.state == "closed" || model.application?.state == "failed" {
            Text(L("closed")).font(.caption).foregroundStyle(.secondary).padding(10)
          }
          ScrollViewReader { proxy in
            ScrollView {
              LazyVStack(alignment: .leading, spacing: 18) {
                if model.messages.isEmpty { Text(L("empty")).foregroundStyle(.secondary).padding() }
                ForEach(model.messages) { message in
                  VStack(alignment: .leading, spacing: 10) {
                    HStack {
                      Spacer(minLength: 30)
                      Text(message.text).padding(12).background(
                        Color.accentColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))
                    }
                    HStack {
                      Text(L(message.status)).font(.caption).foregroundStyle(.secondary)
                      Spacer()
                      Text(Date(timeIntervalSince1970: message.createdAt / 1000), style: .time)
                        .font(.caption2).foregroundStyle(.secondary)
                    }
                    if let reply = message.reply {
                      Text(reply).textSelection(.enabled).padding(12).frame(
                        maxWidth: .infinity, alignment: .leading
                      ).background(.quaternary, in: RoundedRectangle(cornerRadius: 14))
                    }
                    if let error = message.error {
                      Text(error).font(.caption).foregroundStyle(.red)
                    }
                    if ["failed", "interrupted", "cancelled"].contains(message.status) {
                      Button(L("retry")) { model.retry(message) }
                    }
                  }.id(message.id)
                }
              }.padding()
            }.onChange(of: model.messages.count) { _, _ in
              if let id = model.messages.last?.id {
                withAnimation { proxy.scrollTo(id, anchor: .bottom) }
              }
            }
          }
          HStack(alignment: .bottom) {
            TextField(L("placeholder"), text: $model.text, axis: .vertical).lineLimit(1...6)
              .textFieldStyle(.roundedBorder)
            Button(action: model.send) { Image(systemName: "arrow.up.circle.fill").font(.title) }
              .accessibilityLabel(L("send")).disabled(
                model.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                  || model.application == nil)
          }.padding()
        }
        if !model.error.isEmpty {
          Text(model.error).font(.caption).foregroundStyle(.red).padding(8)
        }
      }.navigationTitle("Fn").toolbar {
        ToolbarItem {
          Button {
            Task { await model.resume() }
          } label: {
            Image(systemName: "arrow.clockwise")
          }.accessibilityLabel(L("refresh"))
        }
        ToolbarItem {
          Button {
            Task { await model.notifications() }
          } label: {
            Image(systemName: "bell")
          }.accessibilityLabel(L("notifications"))
        }
      }
    }.task {
      await model.resume()
      while !Task.isCancelled {
        try? await Task.sleep(for: .seconds(5))
        if phase == .active { await model.resume() }
      }
    }.onChange(of: phase) { _, next in if next == .active { Task { await model.resume() } } }
      .onReceive(NotificationCenter.default.publisher(for: .CKAccountChanged)) { _ in
        model.accountChanged()
      }
  }
}
