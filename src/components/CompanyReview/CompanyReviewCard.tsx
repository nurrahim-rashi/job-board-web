import type { CompanyReview } from "../../services/review.service";
import { ratingLabels, ReviewRating } from "./ReviewRating";

function formatSalary(value: number | null) {
  if (value === null) return "Not disclosed";
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function CompanyReviewCard({ review }: { review: CompanyReview }) {
  return (
    <article className="company-review-card">
      <header>
        <div>
          <span className="company-review-anonymous">Anonymous employee</span>
          <h3>{review.jobTitleHeld}</h3>
        </div>

        <time dateTime={review.createdAt}>
          {formatReviewDate(review.createdAt)}
        </time>
      </header>

      <div className="company-review-salary">
        <span>Estimated salary</span>
        <strong>{formatSalary(review.salaryEstimate)}</strong>
      </div>

      <div className="company-review-ratings">
        {ratingLabels.map(({ field, label }) => (
          <div key={field}>
            <span>{label}</span>
            <ReviewRating value={review[field]} />
          </div>
        ))}
      </div>

      <p className="company-review-text">{review.reviewText}</p>
    </article>
  );
}
