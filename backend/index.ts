import dns from "node:dns";
import app from "./src/app.js";
import { env } from "@/config/env.js";
import { startBot } from "@/bot/index.js";
import { logError } from "@/utils/logError.js";

// Some hosts have no working IPv6 route, so connecting to Telegram over IPv6 hangs.
dns.setDefaultResultOrder("ipv4first");

const PORT = env.PORT;
const START_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

app.listen(PORT, () => {
  console.log(`Health-check server running on port ${PORT}`);
});

// Retry brief network failures, then exit if the bot still cannot start (e.g. wrong
// token), so the host shows a failed deploy instead of a "live" server that answers nothing.
for (let attempt = 1; attempt <= START_ATTEMPTS; attempt++) {
  try {
    await startBot();
    break;
  } catch (error) {
    logError(`Error starting bot (attempt ${attempt}/${START_ATTEMPTS}): `, error);
    if (attempt === START_ATTEMPTS) process.exit(1);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}
