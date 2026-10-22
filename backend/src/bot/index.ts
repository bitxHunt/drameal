import { Bot } from "grammy";
import { env } from "@/config/env.js";
import * as breakfastCommand from "@/bot/commands/breakfast.js";
import * as dinnerCommand from "@/bot/commands/dinner.js";
import * as leaderboardCommand from "@/bot/commands/leaderboard.js";
import * as testCommand from "@/bot/commands/test.js";
import * as pollAnswerEvent from "@/bot/events/pollAnswer.js";

export const bot = new Bot(env.BOT_TOKEN);

bot.command("breakfast", breakfastCommand.handle);
bot.command("dinner", dinnerCommand.handle);
bot.command("leaderboard", leaderboardCommand.handle);
bot.command("test", testCommand.handle);

bot.on("poll_answer", pollAnswerEvent.handle);

bot.catch((error) => console.log("Unhandled bot error: ", error));

// poll_answer must be listed explicitly so vote changes reach the bot.
const ALLOWED_UPDATES = ["message", "poll_answer"] as const;

// With WEBHOOK_URL set, Telegram pushes each update to the server (wakes a sleeping
// host straight away, see app.ts). Without it, the bot long-polls.
export const startBot = async () => {
  // The menu people see when they type "/" in the chat.
  await bot.api.setMyCommands([
    { command: "breakfast", description: "Send today's breakfast poll" },
    { command: "dinner", description: "Send today's dinner poll" },
    { command: "leaderboard", description: "Breakfast and dinner streaks" },
  ]);

  if (env.WEBHOOK_URL) {
    await bot.api.setWebhook(env.WEBHOOK_URL, {
      allowed_updates: ALLOWED_UPDATES,
      secret_token: env.WEBHOOK_SECRET,
    });
    console.log("Bot started (webhook)");
    return;
  }

  bot.start({ allowed_updates: ALLOWED_UPDATES });
  console.log("Bot started (long polling)");
};
