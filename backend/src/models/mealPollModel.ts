import { prisma } from "@/config/index.js";
import { Meal } from "@/generated/client";

export const createPoll = (data: {
  id: string;
  chatId: bigint;
  messageId: number;
  meal: Meal;
  date: string;
}) => prisma.mealPoll.create({ data });

export const findPoll = (id: string) => prisma.mealPoll.findUnique({ where: { id } });

export const findPollForDay = (chatId: bigint, meal: Meal, date: string) =>
  prisma.mealPoll.findUnique({ where: { chatId_meal_date: { chatId, meal, date } } });

export const getOpenPolls = (chatId: bigint) =>
  prisma.mealPoll.findMany({ where: { chatId, closed: false } });

export const markClosed = (id: string) =>
  prisma.mealPoll.update({ where: { id }, data: { closed: true } });

export const getPollsWithVotes = (chatId: bigint, meal: Meal) =>
  prisma.mealPoll.findMany({
    where: { chatId, meal },
    include: { votes: { include: { user: true } } },
  });
