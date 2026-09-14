export enum Availability {
  OPEN_TO_WORK = "Open to Work",
  ACTIVELY_INTERVIEWING = "Actively Interviewing",
  AVAILABLE_FOR_FREELANCE = "Available for Freelance",
  NOT_LOOKING = "Not Looking",
}

export const availabilityOptions = Object.values(Availability);

export function isAvailability(value: string): value is Availability {
  return availabilityOptions.some((option) => option === value);
}

export function normalizeAvailability(value: string): Availability | "" {
  if (!value) return "";
  if (isAvailability(value)) return value;

  const normalized = value.trim().toLowerCase();
  if (["open to opportunities", "available", "open to work"].includes(normalized)) {
    return Availability.OPEN_TO_WORK;
  }
  if (normalized.includes("freelance")) return Availability.AVAILABLE_FOR_FREELANCE;
  if (normalized.includes("interview")) return Availability.ACTIVELY_INTERVIEWING;
  if (normalized.includes("not looking")) return Availability.NOT_LOOKING;
  return Availability.OPEN_TO_WORK;
}
