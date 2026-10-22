import { Context } from "grammy";
import * as mealPollModel from "@/models/mealPollModel.js";
import * as userModel from "@/models/userModel.js";
import * as voteModel from "@/models/voteModel.js";
import { closeExpiredPolls, isPastCutoff } from "@/services/mealPoll.js";
import { logError } from "@/utils/logError.js";

// Fires every time someone picks, changes or retracts an answer on a non-anonymous poll.
// Answers count until the meal's cutoff; after that they are ignored and the poll is closed.
export const handle = async (ctx: Context) => {
  const answer = ctx.pollAnswer;
  if (!answer?.user) return;

  try {
    const poll = await mealPollModel.findPoll(answer.poll_id);
    if (!poll) return;

    if (isPastCutoff(poll.meal, poll.date)) {
      await closeExpiredPolls(ctx.api, poll.chatId);
      return;
    }

    const userId = BigInt(answer.user.id);
    await userModel.upsertUser(userId, answer.user.first_name, answer.user.username);

    if (answer.option_ids.length === 0) {
      await voteModel.removeVote(poll.id, userId);
    } else {
      await voteModel.saveVote(poll.id, userId, answer.option_ids[0]);
    }
  } catch (error) {
    logError("Error handling poll answer: ", error);
  }
};
