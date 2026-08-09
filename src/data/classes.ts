import { ClassSchedule } from "@/src/types";

// Mock data — replace with a Supabase query later (`classes` table).
// Flat array with a stable `id` per class (previously an object keyed by
// day with no id at all — fine for read-only display, but not enough to
// create/update/delete a specific class against a real table).
export const CLASSES: ClassSchedule[] = [
  { id: "mon-0600", day: "Monday", time: "06:00", title: "Morning Wushu — Taolu", type: "wushu", level: "All Levels", durationMinutes: 90 },
  { id: "mon-0900", day: "Monday", time: "09:00", title: "Zumba", type: "fitness", durationMinutes: 60 },
  { id: "mon-1700", day: "Monday", time: "17:00", title: "Wushu — Sanda", type: "wushu", level: "Intermediate+", durationMinutes: 90 },
  { id: "mon-1900", day: "Monday", time: "19:00", title: "Aerobics", type: "fitness", durationMinutes: 60 },

  { id: "tue-0600", day: "Tuesday", time: "06:00", title: "Morning Wushu — Taolu", type: "wushu", level: "All Levels", durationMinutes: 90 },
  { id: "tue-0900", day: "Tuesday", time: "09:00", title: "Tae Bo", type: "fitness", durationMinutes: 60 },
  { id: "tue-1700", day: "Tuesday", time: "17:00", title: "Wushu — Taolu", type: "wushu", level: "Beginners", durationMinutes: 90 },
  { id: "tue-1900", day: "Tuesday", time: "19:00", title: "Zumba", type: "fitness", durationMinutes: 60 },

  { id: "wed-0600", day: "Wednesday", time: "06:00", title: "Morning Wushu — Sanda", type: "wushu", level: "All Levels", durationMinutes: 90 },
  { id: "wed-0900", day: "Wednesday", time: "09:00", title: "Aerobics", type: "fitness", durationMinutes: 60 },
  { id: "wed-1700", day: "Wednesday", time: "17:00", title: "Wushu — Taolu", type: "wushu", level: "Advanced", durationMinutes: 90 },
  { id: "wed-1900", day: "Wednesday", time: "19:00", title: "Tae Bo", type: "fitness", durationMinutes: 60 },

  { id: "thu-0600", day: "Thursday", time: "06:00", title: "Morning Wushu — Taolu", type: "wushu", level: "All Levels", durationMinutes: 90 },
  { id: "thu-0900", day: "Thursday", time: "09:00", title: "Zumba", type: "fitness", durationMinutes: 60 },
  { id: "thu-1700", day: "Thursday", time: "17:00", title: "Wushu — Sanda", type: "wushu", level: "Intermediate+", durationMinutes: 90 },
  { id: "thu-1900", day: "Thursday", time: "19:00", title: "Aerobics", type: "fitness", durationMinutes: 60 },

  { id: "fri-0600", day: "Friday", time: "06:00", title: "Morning Wushu — Taolu", type: "wushu", level: "All Levels", durationMinutes: 90 },
  { id: "fri-0900", day: "Friday", time: "09:00", title: "Tae Bo", type: "fitness", durationMinutes: 60 },
  { id: "fri-1700", day: "Friday", time: "17:00", title: "Open Wushu Training", type: "wushu", level: "All Levels", durationMinutes: 120 },
  { id: "fri-1900", day: "Friday", time: "19:00", title: "Zumba", type: "fitness", durationMinutes: 60 },

  { id: "sat-0800", day: "Saturday", time: "08:00", title: "Weekend Wushu — Taolu", type: "wushu", level: "All Levels", durationMinutes: 120 },
  { id: "sat-1000", day: "Saturday", time: "10:00", title: "Wushu — Sanda", type: "wushu", level: "Intermediate+", durationMinutes: 90 },
  { id: "sat-1400", day: "Saturday", time: "14:00", title: "Zumba & Aerobics Mix", type: "fitness", durationMinutes: 60 },
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const getClassesByDay = (day: string) => CLASSES.filter((c) => c.day === day);

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}