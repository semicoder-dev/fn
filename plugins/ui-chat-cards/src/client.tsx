import React, { useEffect, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import type { APIClient } from "@semicoder/fia/api";
import { client, readAllPages } from "@semicoder/fn-sdk/client";
import type {} from "@semicoder/fn-ui-chat/contract";
import api from "@semicoder/fn-chat-cards/api";
import type { SessionCard } from "@semicoder/fn-chat-cards/contract";
import Card from "./card.tsx";
export const inject = ["chatSlots", "api:cards", "slots", "platform"];
function Cards({
  remote,
  sessionId,
  enabled,
}: {
  remote: APIClient<typeof api>;
  sessionId: string;
  enabled: boolean;
}) {
  const [cards, setCards] = useState<SessionCard[]>([]),
    [error, setError] = useState("");
  const refresh = async () =>
    setCards(
      await readAllPages((offset, limit) => remote.call("list", { sessionId, offset, limit })),
    );
  useEffect(() => {
    let alive = true;
    const read = () =>
      void readAllPages((offset, limit) => remote.call("list", { sessionId, offset, limit }))
        .then((value) => {
          if (alive) setCards(value);
        })
        .catch((error) => {
          if (alive) setError(String(error));
        });
    const off = remote.on("changed", (event) => {
        if (event.sessionId === sessionId) read();
      }),
      reconnect = remote.onReconnect(read);
    setCards([]);
    read();
    return () => {
      alive = false;
      off();
      reconnect();
    };
  }, [sessionId]);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {cards.map((card) => (
        <Card key={card.id} remote={remote} record={card} enabled={enabled} refresh={refresh} />
      ))}
    </>
  );
}
export function apply(ctx: Context) {
  const remote = client(ctx, "cards", api);
  ctx.slots.register({ name: "fn.chat.cards", id: "cards", inject: () => ({ remote }) }, Cards);
}
