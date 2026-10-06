import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "YYYY-MM-DD" strings are service days. new Date("2026-10-05") parses as UTC midnight,
// which is the evening before in Pacific time, so parse and format them in local time.
export function parseLocalDate(day: string): Date {
  return new Date(`${day}T00:00:00`);
}

export function toLocalDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
