export type RatingField =
  | "ratingCulture"
  | "ratingWorkLife"
  | "ratingFacility"
  | "ratingCareer";

export const ratingLabels: { field: RatingField; label: string }[] = [
  { field: "ratingCulture", label: "Work culture" },
  { field: "ratingWorkLife", label: "Work-life balance" },
  { field: "ratingFacility", label: "Facilities" },
  { field: "ratingCareer", label: "Career opportunities" },
];

export function ReviewRating({ value }: { value: number }) {
  return (
    <span className="company-review-stars" aria-label={`${value} out of 5`}>
      {"★".repeat(value)}
      <i>{"★".repeat(5 - value)}</i>
    </span>
  );
}
