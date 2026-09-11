"use server";
//Yeh function browser ke liye ek scoped entry-pass generate karta hai, taaki frontend Inngest Realtime ke sath secure connection bana kar canvas ke nodes ka live "status" update sun sake.

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";

export type HttpRequestToken = Realtime.Token<
  typeof httpRequestChannel,
  ["status"]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: httpRequestChannel(),
    topics: ["status"],
  });
  return token;
}
