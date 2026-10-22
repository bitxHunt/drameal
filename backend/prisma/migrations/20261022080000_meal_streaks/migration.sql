-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Meal" AS ENUM ('BREAKFAST', 'DINNER');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL,
    "firstName" TEXT NOT NULL,
    "username" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPoll" (
    "id" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "meal" "Meal" NOT NULL,
    "date" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPoll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "pollId" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "optionId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("pollId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealPoll_chatId_meal_date_key" ON "MealPoll"("chatId", "meal", "date");

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "MealPoll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

