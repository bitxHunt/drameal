import { prisma } from "@/config/index.js";

export const saveVote = (pollId: string, userId: bigint, optionId: number) =>
  prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    create: { pollId, userId, optionId },
    update: { optionId },
  });

export const removeVote = (pollId: string, userId: bigint) =>
  prisma.pollVote.deleteMany({ where: { pollId, userId } });
