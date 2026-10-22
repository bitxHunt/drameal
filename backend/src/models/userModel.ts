import { prisma } from "@/config/index.js";

export const upsertUser = (id: bigint, firstName: string, username?: string) =>
  prisma.user.upsert({
    where: { id },
    create: { id, firstName, username },
    update: { firstName, username },
  });
