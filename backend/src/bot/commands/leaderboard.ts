import { Context } from "grammy";
import { Meal } from "@/generated/client.js";
import { MEAL_CONFIG } from "@/types/bot.type.js";
import { closeExpiredPolls } from "@/services/mealPoll.js";
import { getLeaderboard } from "@/services/streak.js";

export const handle = async (ctx: Context) => {
  try {
    if (!ctx.chat) return;
    const chatId = BigInt(ctx.chat.id);
    await closeExpiredPolls(ctx.api, chatId);

    const sections = [];
    for (const meal of [Meal.BREAKFAST, Meal.DINNER]) {
      const { emoji, label } = MEAL_CONFIG[meal];
      const rows = await getLeaderboard(chatId, meal);
      const lines = rows.length
        ? rows.map((row, i) => `${i + 1}. ${row.name}  🔥 ${row.current}  (best ${row.best})`)
        : ["No streaks yet."];
      sections.push([`${emoji} ${label}`, ...lines].join("\n"));
    }

    await ctx.reply(["🏆 Leaderboard", ...sections].join("\n\n"));
  } catch (error) {
    console.log("Error handling /leaderboard: ", error);
    await ctx.reply("Something went wrong loading the leaderboard.");
  }
};
