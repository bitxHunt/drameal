import { config } from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";
config({ path: `.env.${nodeEnv}` });

// Blank optional values in .env files ("WEBHOOK_URL=") count as not set.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().min(1),
  BOT_TOKEN: z
    .string()
    .regex(
      /^\d+:[A-Za-z0-9_-]{35}$/,
      "BOT_TOKEN must look like 123456789:<35 characters> (copy it again from @BotFather)",
    ),
  DATABASE_URL: z.string().min(1),
  TIMEZONE: z.string().min(1).default("Asia/Singapore"),
  WEBHOOK_URL: optional(z.url()),
  WEBHOOK_SECRET: optional(z.string().min(1)),
});

export const env = envSchema.parse(process.env);
