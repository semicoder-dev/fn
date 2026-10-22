import { Service, type Context } from "@deepseek-ai/cordis";
import { join } from "node:path";
import type {} from "@semicoder/fn-host";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-session-controller/service";
import {
  cardSchema,
  cardValuesSchema,
  sessionCardSchema,
  validateResponse,
  type CardContribution,
  type CardResponse,
  type SessionCard,
} from "./contract.ts";
import { CardStore } from "./store.ts";
interface Owner {
  controller: AbortController;
  cardActions: Map<
    string,
    (response: CardResponse & { signal: AbortSignal }) => void | Promise<void>
  >;
  operations: Set<Promise<unknown>>;
}
export default class CardsService extends Service {
  static inject = ["sessionController", "activity"];
  private readonly owners = new Map<string, Owner>();
  readonly store: CardStore;
  constructor(ctx: Context) {
    super(ctx, "cards");
    this.store = new CardStore(join(ctx.host.dataDirectory, "cards", "state.sqlite"));
  }
  async *[Service.init]() {
    yield async () => {
      for (const owner of this.owners.values())
        owner.controller.abort(new Error("Card service disposed"));
      await Promise.allSettled([...this.owners.values()].flatMap((owner) => [...owner.operations]));
      this.owners.clear();
      this.store.close();
    };
    this.ctx.activity.watch(() =>
      [...this.owners.values()].some((owner) => owner.operations.size > 0),
    );
  }
  register(
    name: string,
    handler: (response: CardResponse & { signal: AbortSignal }) => void | Promise<void>,
  ): () => void {
    const ownerId = this.ownerId();
    if (!/^[a-z][a-zA-Z0-9_.-]{0,99}$/.test(name)) throw new Error("Invalid card action name");
    let owner = this.owners.get(ownerId);
    if (!owner) {
      owner = { controller: new AbortController(), cardActions: new Map(), operations: new Set() };
      this.owners.set(ownerId, owner);
    }
    if (owner.cardActions.has(name)) throw new Error("Duplicate card action");
    const record = owner;
    return this.ctx.effect(() => {
      record.cardActions.set(name, handler);
      return async () => {
        record.cardActions.delete(name);
        if (!record.cardActions.size) record.controller.abort(new Error("Card plugin disposed"));
        await Promise.allSettled([...record.operations]);
        if (!record.cardActions.size) this.owners.delete(ownerId);
      };
    });
  }
  create(sessionId: string, input: Parameters<CardContribution["create"]>[1]) {
    return this.createCard(this.ownerId(), sessionId, input);
  }
  cancel(id: string) {
    return this.cancelCard(this.ownerId(), id);
  }
  private ownerId(): string {
    let entry = this.ctx.fiber.entry;
    if (!entry) throw new Error("Card contributions require a configured plugin instance");
    const path: string[] = [],
      seen = new Set<object>();
    while (entry && !seen.has(entry)) {
      seen.add(entry);
      path.unshift(entry.id);
      entry = entry.parent.ctx.fiber.entry;
    }
    return path.join(":");
  }

  private owner(id: string): Owner {
    const value = this.owners.get(id);
    if (!value) throw new Error("Card owner is unavailable");
    return value;
  }
  private assertRunning() {
    this.ctx.activity.assertAccepting();
  }
  private changed(sessionId: string) {
    this.ctx.emit("fn/cards-change", sessionId);
  }
  createCard(
    ownerId: string,
    sessionId: string,
    input: Parameters<CardContribution["create"]>[1],
  ): SessionCard {
    this.assertRunning();
    this.owner(ownerId);
    this.ctx.sessionController.session(sessionId);
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(input.key)) throw new Error("Invalid card key");
    if (!this.owner(ownerId).cardActions.has(input.handler))
      throw new Error("Card action handler is unavailable");
    const card = cardSchema.parse(input.card);
    if (Buffer.byteLength(JSON.stringify(card)) > 65536) throw new Error("Card exceeds 64 KiB");
    const previous = this.store
      .cards(sessionId)
      .find((value) => value.ownerId === ownerId && value.key === input.key);
    if (previous) {
      if (
        previous.handler !== input.handler ||
        JSON.stringify(previous.card) !== JSON.stringify(card) ||
        (input.expiresAt !== undefined && input.expiresAt !== previous.expiresAt)
      )
        throw new Error("Card key reused for a different request");
      return this.cards(sessionId).find((value) => value.id === previous.id)!;
    }
    const createdAt = Date.now(),
      expiresAt = input.expiresAt ?? createdAt + 86400000;
    if (
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= createdAt ||
      expiresAt > createdAt + 30 * 86400000
    )
      throw new Error("Invalid card expiry");
    const value = {
      id: crypto.randomUUID(),
      sessionId,
      createdAt,
      expiresAt,
      state: "pending" as const,
      card,
    };
    this.store.putCard({ ...value, ownerId, key: input.key, handler: input.handler });
    this.changed(sessionId);
    return value;
  }
  cards(sessionId: string): SessionCard[] {
    this.ctx.sessionController.session(sessionId);
    return this.store.cards(sessionId).map((value) => {
      if (value.state === "pending" && value.expiresAt <= Date.now()) {
        value.state = "expired";
        this.store.putCard(value, "pending");
      }
      const { ownerId: _app, handler: _handler, key: _key, ...publicValue } = value;
      return sessionCardSchema.parse(publicValue);
    });
  }
  cancelCard(ownerId: string, id: string) {
    this.assertRunning();
    this.owner(ownerId);
    const value = this.store.card(id);
    if (!value || value.ownerId !== ownerId) throw new Error("Card does not belong to this plugin");
    if (!this.store.putCard({ ...value, state: "cancelled" }, "pending"))
      throw new Error("Card is no longer pending");
    this.changed(value.sessionId);
  }
  async respondCard(
    sessionId: string,
    id: string,
    actionId: string,
    input: CardResponse["values"],
  ): Promise<void> {
    this.assertRunning();
    const value = this.store.card(id);
    if (!value || value.sessionId !== sessionId)
      throw new Error("Card does not belong to this Session");
    const slot = this.owner(value.ownerId),
      handler = slot.cardActions.get(value.handler);
    if (!handler) throw new Error("Card action handler is unavailable");
    if (value.state !== "pending" || value.expiresAt <= Date.now())
      throw new Error("Card was answered, cancelled or expired");
    const values = cardValuesSchema.parse(input);
    if (Buffer.byteLength(JSON.stringify(values)) > 32768)
      throw new Error("Card response exceeds 32 KiB");
    validateResponse(value.card, actionId, values);
    value.answer = { actionId, values };
    value.state = "running";
    if (!this.store.putCard(value, "pending")) throw new Error("Card was already answered");
    this.changed(sessionId);
    const operation = Promise.resolve().then(() =>
      handler({ sessionId, cardId: id, actionId, values, signal: slot.controller.signal }),
    );
    slot.operations.add(operation);
    try {
      await operation;
      slot.controller.signal.throwIfAborted();
      value.state = "completed";
    } catch (error) {
      value.state = "failed";
      value.error = "Plugin card action failed; it will not be replayed.";
      throw error;
    } finally {
      try {
        this.store.putCard(value, "running");
        this.changed(sessionId);
      } finally {
        slot.operations.delete(operation);
      }
    }
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    cards: CardsService;
  }
  interface Events {
    "fn/cards-change"(sessionId: string): void;
  }
}
