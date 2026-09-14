import type { AnswerOption, SavedAnswer } from "../../types/pre-selection-test";

export const warningSeconds = 120;

export function formatCountdown(seconds: number) {
  const left = Math.max(0, seconds);
  const minutes = String(Math.floor(left / 60)).padStart(2, "0");
  return `${minutes}:${String(left % 60).padStart(2, "0")}`;
}

export function toAnswerMap(saved: SavedAnswer[]) {
  const map: Record<number, AnswerOption> = {};
  for (const answer of saved) map[answer.questionId] = answer.selectedAnswer;
  return map;
}

export function formatMoment(value: string) {
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
