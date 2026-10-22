import { Api, Context } from "grammy";
import { Meal, Prisma } from "@/generated/client.js";
import { MEAL_CONFIG } from "@/types/bot.type.js";
import { formatPollDate, nowInTimezone } from "@/utils/time.js";
import * as mealPollModel from "@/models/mealPollModel.js";

// True once the meal's cutoff time has passed on the given date.
export const isPastCutoff = (meal: Meal, date: string) => {
  const now = nowInTimezone();
  return now.date > date || (now.date === date && now.minutes >= MEAL_CONFIG[meal].cutoffMinutes);
};

// There is no scheduler (the host can sleep), so expired polls are closed lazily
// whenever the bot is next used in that chat.
export const closeExpiredPolls = async (api: Api, chatId: bigint) => {
  const openPolls = await mealPollModel.getOpenPolls(chatId);
  for (const poll of openPolls) {
    if (!isPastCutoff(poll.meal, poll.date)) continue;
    try {
      await api.stopPoll(Number(poll.chatId), poll.messageId);
    } catch (error) {
      console.log("Error stopping poll: ", error); // e.g. message deleted, still mark it closed
    }
    await mealPollModel.markClosed(poll.id);
  }
};

// Points people at the poll already sent today (or just says so if it was deleted).
const replyAlreadySent = (ctx: Context, meal: Meal, messageId: number) =>
  ctx.reply(`Today's ${MEAL_CONFIG[meal].label.toLowerCase()} poll has already been sent.`, {
    reply_parameters: { message_id: messageId, allow_sending_without_reply: true },
  });

// Posts today's non-anonymous "<D Month> OG <Meal>" poll and records it so the
// answers can be tracked for streaks. Only one poll per meal per day per chat.
export const sendMealPoll = async (ctx: Context, meal: Meal) => {
  if (!ctx.chat) return;
  const config = MEAL_CONFIG[meal];
  const chatId = BigInt(ctx.chat.id);
  const { date } = nowInTimezone();

  await closeExpiredPolls(ctx.api, chatId);

  if (isPastCutoff(meal, date)) {
    await ctx.reply(`${config.label} voting for today closed at ${config.cutoffLabel}.`);
    return;
  }

  const existing = await mealPollModel.findPollForDay(chatId, meal, date);
  if (existing) {
    await replyAlreadySent(ctx, meal, existing.messageId);
    return;
  }

  const message = await ctx.replyWithPoll(
    `${formatPollDate(date)} OG ${config.label}`,
    config.slots.map((slot) => ({ text: slot })),
    { is_anonymous: false },
  );

  try {
    await mealPollModel.createPoll({
      id: message.poll.id,
      chatId,
      messageId: message.message_id,
      meal,
      date,
    });
  } catch (error) {
    // Two people sent the command at the same moment: keep the first poll, remove this one.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await ctx.api.deleteMessage(ctx.chat.id, message.message_id);
      const first = await mealPollModel.findPollForDay(chatId, meal, date);
      if (first) await replyAlreadySent(ctx, meal, first.messageId);
      return;
    }
    throw error;
  }
};
