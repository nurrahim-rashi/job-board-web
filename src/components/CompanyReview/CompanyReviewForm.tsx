import { useState, type FormEvent } from "react";

import {
  createCompanyReview,
  type CreateCompanyReviewData,
} from "../../services/review.service";
import { ratingLabels, type RatingField } from "./ReviewRating";

type Props = {
  companyId: string;
  jobTitleHeld: string;
  onSubmitted: () => Promise<void>;
};

const initialForm: CreateCompanyReviewData = {
  ratingCulture: 5,
  ratingWorkLife: 5,
  ratingFacility: 5,
  ratingCareer: 5,
  reviewText: "",
};

export function CompanyReviewForm({
  companyId,
  jobTitleHeld,
  onSubmitted,
}: Props) {
  const [form, setForm] = useState<CreateCompanyReviewData>(initialForm);
  const [salary, setSalary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setRating = (field: RatingField, value: number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createCompanyReview(companyId, {
        ...form,
        salaryEstimate: salary.trim() ? Number(salary) : undefined,
      });

      setForm(initialForm);
      setSalary("");
      await onSubmitted();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="company-review-form" onSubmit={submitReview}>
      <header>
        <div>
          <span className="company-review-eyebrow">
            Verified employee review
          </span>
          <h3>Share your experience</h3>
        </div>

        <span className="company-review-private">
          Your identity stays private
        </span>
      </header>

      <div className="company-review-verified-role">
        <span>Position shown publicly</span>
        <strong>{jobTitleHeld}</strong>
      </div>

      <label>
        Estimated monthly salary
        <small>Optional · IDR</small>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
          placeholder="12000000"
        />
      </label>

      <div className="company-review-rating-form">
        {ratingLabels.map(({ field, label }) => (
          <fieldset key={field}>
            <legend>{label}</legend>

            <div>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={form[field] >= value ? "selected" : ""}
                  aria-label={`${label}: ${value} out of 5`}
                  onClick={() => setRating(field, value)}
                >
                  ★
                </button>
              ))}

              <span>{form[field]}/5</span>
            </div>
          </fieldset>
        ))}
      </div>

      <label className="company-review-comment">
        Your review
        <textarea
          required
          maxLength={2000}
          value={form.reviewText}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              reviewText: event.target.value,
            }))
          }
          placeholder="What was it like working here?"
        />
        <small>{form.reviewText.length}/2000</small>
      </label>

      {error && <p className="company-review-submit-error">{error}</p>}

      <button
        className="button button-primary company-review-submit"
        type="submit"
        disabled={submitting || !form.reviewText.trim()}
      >
        {submitting ? "Submitting…" : "Submit anonymous review"}
      </button>
    </form>
  );
}
