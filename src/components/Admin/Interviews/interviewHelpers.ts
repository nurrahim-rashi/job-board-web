import type { Interview } from "../../../types/interview";

const pad = (value: number) => String(value).padStart(2, "0");

export function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export function toIso(local: string) {
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function formatSchedule(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function isMeetingLink(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

/** Interviews still ahead of us, counted from now. */
export function daysUntil(iso: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function countdownLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function reminderState(interview: Interview) {
  if (interview.status === "CANCELLED") return { tone: "", label: "Not sent" };
  if (interview.reminderSentAt) return { tone: "good", label: `Sent ${formatDay(interview.reminderSentAt)}` };
  const days = daysUntil(interview.interviewDate);
  if (days < 0) return { tone: "", label: "Not sent" };
  if (days <= 1) return { tone: "wait", label: "Sending H-1" };
  return { tone: "", label: `Queued H-1` };
}

export function defaultSlot(index: number, taken: string[]) {
  const base = new Date();
  base.setDate(base.getDate() + 1);
  base.setHours(9, 0, 0, 0);
  base.setMinutes(base.getMinutes() + index * 30);

  const busy = new Set(taken.filter(Boolean).map((value) => new Date(value).getTime()));
  while (busy.has(base.getTime())) base.setMinutes(base.getMinutes() + 30);

  return toLocalInput(base.toISOString());
}

export function minDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return toLocalInput(now.toISOString());
}
