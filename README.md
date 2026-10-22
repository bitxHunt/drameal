# 🍽️ Drameal Bot

## Description

A Telegram meal bot for the group chat ([@drameal_bot](https://t.me/drameal_bot)). Anyone in the chat sends a breakfast or dinner poll, everyone votes on the slot they're joining, and showing up day after day builds a **streak**. Breakfast and dinner streaks are separate. No penalties, no check-ins: your vote is your word.

## Inspiration

Group meal plans fall apart in the chat: "what time?" gets asked five times and nobody knows who's coming when. **Drameal** puts one clean poll in the chat, and the streaks give everyone a reason to keep turning up.

## Commands

- `/breakfast` sends "<date> OG Breakfast" with slots 7:30, 8:00, 8:30, 9:00 AM
- `/dinner` sends "<date> OG Dinner" with slots 6:00, 6:30, 7:00, 7:30 PM
- `/leaderboard` shows the top 10 current streaks (and best ever) for each meal

Only one breakfast and one dinner poll per day. Sending it again replies to the existing poll instead.

## How Streaks Work

| | Breakfast | Dinner |
|---|---|---|
| Streak days | Mon to Sat | Sun to Fri |
| Votes lock at | 11:00 AM | 10:00 PM |

- Change or retract your vote any time before the lock. After it, the poll closes and that day counts.
- Voted for any slot on a streak day: streak +1. Didn't vote: streak back to 0.
- A day nobody sent a poll is skipped, so it doesn't break anyone's streak.
- Polls sent on other days (e.g. Sunday breakfast) still work, they just don't count.

## Setup

1. Go into the backend folder and install packages with **pnpm install**.

2. Copy **.env.production.example** to **.env.development** and fill in `PORT`, `BOT_TOKEN` (from @BotFather), `DATABASE_URL` and `TIMEZONE`.

3. Run **pnpm prisma migrate deploy** to create the database tables.

4. Run **pnpm dev** to start the bot with auto-reload, or **pnpm build** then **pnpm start** for production.

5. Add the bot to your group chat and send `/breakfast` or `/dinner`.

Use a separate test bot from @BotFather for local development. Running locally with the live bot's token switches it off webhook mode and the deployed bot stops getting updates until it restarts.

## Deploy (Render)

Create a **Web Service** from this repo (free tier) with:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `pnpm install --prod=false && pnpm prisma migrate deploy && pnpm build` |
| Start Command | `pnpm start` |
| Health Check Path | `/health` |

Environment variables: `NODE_ENV=production`, `NODE_VERSION=22`, `PORT=10000`, `BOT_TOKEN`, `DATABASE_URL`, `TIMEZONE=Asia/Singapore`, `WEBHOOK_URL=https://<service>.onrender.com/telegram`, `WEBHOOK_SECRET=<any random string>`.

The free tier sleeps after 15 minutes idle. With `WEBHOOK_URL` set, Telegram wakes it with every command and vote, so votes are counted on time. Leave the webhook variables blank only on a host that never sleeps (the bot then uses long polling).

## File Structure

```
backend/
├── index.ts                     # Entry point: starts the server and the bot
├── prisma.config.ts             # Points Prisma at the schema and DATABASE_URL
├── .env.production.example      # Template for the env variables
├── prisma/
│   ├── schema.prisma            # Tables: User, MealPoll (one per poll sent), PollVote (each user's answer)
│   └── migrations/              # SQL that creates those tables
└── src/
    ├── app.ts                   # Express: /health check, plus the webhook route when WEBHOOK_URL is set
    ├── config/
    │   ├── env.ts               # Loads .env.<NODE_ENV> and checks every variable with zod
    │   └── index.ts             # The shared Prisma client
    ├── bot/
    │   ├── index.ts             # Creates the bot, links commands and events, starts polling or webhook
    │   ├── commands/
    │   │   ├── breakfast.ts     # /breakfast: sends the breakfast poll
    │   │   ├── dinner.ts        # /dinner: sends the dinner poll
    │   │   ├── leaderboard.ts   # /leaderboard: formats both meals' streak tables
    │   │   └── test.ts          # /test: replies with uptime to check the bot is alive
    │   └── events/
    │       └── pollAnswer.ts    # Saves, changes or removes a vote; ignores votes after the lock
    ├── models/
    │   ├── mealPollModel.ts     # Database queries for polls
    │   ├── voteModel.ts         # Database queries for votes
    │   └── userModel.ts         # Saves each voter's name for the leaderboard
    ├── services/
    │   ├── mealPoll.ts          # Sends and records polls, checks the lock time, closes expired polls
    │   └── streak.ts            # Works out current and best streaks from the saved votes
    ├── types/
    │   └── bot.type.ts          # Per-meal settings: slots, streak days, lock time
    └── utils/
        └── time.ts              # Today's date and time in TIMEZONE, weekday, poll title date
```

## Tech Stack

- **Bot**: Node/TypeScript, [grammY](https://grammy.dev/), long polling or webhook
- **Backend**: Express (health check + optional webhook)
- **DB**: Postgres via Prisma
