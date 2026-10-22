import express from "express";
import { webhookCallback } from "grammy";
import { env } from "@/config/env.js";
import { bot } from "@/bot/index.js";

const app = express();
app.use(express.json());

// Host-level uptime check only.
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "ok" });
});

// Only mounted in webhook mode: Telegram POSTs every update to the path in WEBHOOK_URL.
if (env.WEBHOOK_URL) {
  app.post(
    new URL(env.WEBHOOK_URL).pathname,
    webhookCallback(bot, "express", { secretToken: env.WEBHOOK_SECRET }),
  );
}

export default app;
