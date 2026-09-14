export const educationOptions = [
  "Elementary School",
  "Middle School",
  "High School",
  "Vocational High School",
  "Diploma",
  "Associate Degree",
  "Bachelor",
  "Master",
  "Doctorate",
  "Other",
] as const;

export type EducationLevel = (typeof educationOptions)[number];

export function isEducationLevel(value: string): value is EducationLevel {
  return educationOptions.some((option) => option === value);
}

export function normalizeEducation(value: string | null): EducationLevel | "" {
  if (!value) return "";
  if (isEducationLevel(value)) return value;

  const normalized = value.trim().toUpperCase().replaceAll("_", " ");
  if (["SD", "ELEMENTARY"].includes(normalized)) return "Elementary School";
  if (["SMP", "JUNIOR HIGH SCHOOL"].includes(normalized)) return "Middle School";
  if (["SMA", "SMA / SMK", "SMA/SMK"].includes(normalized)) return "High School";
  if (["SMK", "VOCATIONAL SCHOOL"].includes(normalized)) return "Vocational High School";
  if (["D1", "D2", "D3", "D4"].includes(normalized) || normalized.includes("DIPLOMA")) {
    return "Diploma";
  }
  if (["S1", "UNDERGRADUATE", "BACHELOR DEGREE", "BACHELOR'S DEGREE"].includes(normalized)) {
    return "Bachelor";
  }
  if (["S2", "MASTER DEGREE", "MASTER'S DEGREE"].includes(normalized)) return "Master";
  if (["S3", "PHD", "DOCTORAL DEGREE"].includes(normalized)) return "Doctorate";
  return "Other";
}
