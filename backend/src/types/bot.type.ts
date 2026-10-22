import { Meal } from "@/generated/client";

// Days use JS numbering: 0 = Sunday ... 6 = Saturday. A poll sent on any other
// day still works, it just never adds to or breaks a streak.
export const MEAL_CONFIG = {
  [Meal.BREAKFAST]: {
    label: "Breakfast",
    emoji: "🍳",
    slots: ["7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"],
    streakDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    cutoffMinutes: 11 * 60,
    cutoffLabel: "11:00 AM",
  },
  [Meal.DINNER]: {
    label: "Dinner",
    emoji: "🍽️",
    slots: ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"],
    streakDays: [0, 1, 2, 3, 4, 5], // Sun-Fri
    cutoffMinutes: 22 * 60,
    cutoffLabel: "10:00 PM",
  },
} as const;

export const LEADERBOARD_SIZE = 10;
