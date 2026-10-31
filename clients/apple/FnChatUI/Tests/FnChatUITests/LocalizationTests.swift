import Testing

@testable import FnChatUI

@Test @MainActor func relayStatesHaveVisibleLabels() {
  for state in [
    "queued", "waiting", "processing", "completed", "interrupted", "failed", "cancelled",
  ] {
    #expect(!L(state).isEmpty)
    #expect(L(state) != state)
  }
}
