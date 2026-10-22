import { Context } from "grammy";
import { Meal } from "@/generated/client.js";
import { sendMealPoll } from "@/services/mealPoll.js";
import { logError } from "@/utils/logError.js";

export const handle = async (ctx: Context) => {
  try {
    await sendMealPoll(ctx, Meal.BREAKFAST);
  } catch (error) {
    logError("Error handling /breakfast: ", error);
    await ctx.reply("Something went wrong posting the breakfast poll.");
  }
};
