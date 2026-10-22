import { Meal } from "@/generated/client.js";
import { LEADERBOARD_SIZE, MEAL_CONFIG } from "@/types/bot.type.js";
import { weekdayOf } from "@/utils/time.js";
import { isPastCutoff } from "@/services/mealPoll.js";
import * as mealPollModel from "@/models/mealPollModel.js";

// Walks the counted days in order: attending extends the run, missing resets it.
// `days` must be sorted ascending.
export const getStreaks = (days: string[], attended: Set<string>) => {
  let current = 0;
  let best = 0;
  for (const day of days) {
    current = attended.has(day) ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return { current, best };
};

// A day counts only if it is a streak day for this meal, a poll was sent that day,
// and the cutoff has passed. Days nobody sent a poll are skipped, not missed.
export const getLeaderboard = async (chatId: bigint, meal: Meal) => {
  const polls = await mealPollModel.getPollsWithVotes(chatId, meal);
  const countedPolls = polls.filter(
    (poll) =>
      (MEAL_CONFIG[meal].streakDays as readonly number[]).includes(weekdayOf(poll.date)) &&
      isPastCutoff(meal, poll.date),
  );

  const days = [...new Set(countedPolls.map((poll) => poll.date))].sort();

  const players = new Map<bigint, { name: string; attended: Set<string> }>();
  for (const poll of countedPolls) {
    for (const vote of poll.votes) {
      const player = players.get(vote.userId) ?? { name: vote.user.firstName, attended: new Set() };
      player.attended.add(poll.date);
      players.set(vote.userId, player);
    }
  }

  return [...players.values()]
    .map((player) => ({ name: player.name, ...getStreaks(days, player.attended) }))
    .sort((a, b) => b.current - a.current || b.best - a.best)
    .slice(0, LEADERBOARD_SIZE);
};
