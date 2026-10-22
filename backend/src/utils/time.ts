import { env } from "@/config/env.js";

// Today's date (YYYY-MM-DD) and minutes since midnight, in env.TIMEZONE.
export const nowInTimezone = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: env.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)!.value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

// 0 = Sunday ... 6 = Saturday, for a YYYY-MM-DD date.
export const weekdayOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

// "2026-10-22" -> "22 October"
export const formatPollDate = (date: string) =>
  new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
