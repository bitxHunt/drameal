import { inspect } from "node:util";
import { env } from "@/config/env.js";

// Telegram network errors include the request URL, which contains the bot token,
// so it is masked before anything reaches the host's logs.
export const logError = (label: string, error: unknown) => {
  console.log(label, inspect(error, { depth: 4 }).replaceAll(env.BOT_TOKEN, "<BOT_TOKEN>"));
};
