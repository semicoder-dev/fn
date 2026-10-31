/** Source-only product packages until the Chat use case is ready for release.
 * Shared Agent, Session, model and tool services remain available in both profiles.
 */
export const experimentalChatPackages = new Set([
  "@semicoder/fn-chat",
  "@semicoder/fn-chat-cards",
  "@semicoder/fn-chat-cloudkit",
  "@semicoder/fn-ui-chat",
  "@semicoder/fn-ui-chat-cards",
  "@semicoder/fn-ui-cloudkit",
]);
