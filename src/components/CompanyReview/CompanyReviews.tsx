import { useCallback, useEffect, useState } from "react";

import {
  getCompanyReviews,
  type CompanyReview,
  type CompanyReviewViewer,
} from "../../services/review.service";
import { useAuth } from "../../stores/useAuth";
import { CompanyReviewCard } from "./CompanyReviewCard";
import { CompanyReviewForm } from "./CompanyReviewForm";
import "./CompanyReviews.css";

type Props = {
  companyId: string;
};

const defaultViewer: CompanyReviewViewer = {
  canReview: false,
  hasReviewed: false,
  jobTitleHeld: null,
};

export function CompanyReviews({ companyId }: Props) {
  const user = useAuth((state) => state.user);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [viewer, setViewer] = useState(defaultViewer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCompanyReviews(companyId);
      setReviews(data.reviews);
      setViewer(data.viewer);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load reviews",
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  return (
    <section className="company-reviews-section">
      <article className="company-paper-card company-reviews-shell">
        <header className="company-reviews-heading">
          <div>
            <span className="company-review-eyebrow">Employee experience</span>
            <h2>Company reviews</h2>
            <p>
              Reviews are anonymous. Positions are verified from accepted job
              applications and shown for context.
            </p>
          </div>

          <strong>
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </strong>
        </header>

        {loading ? (
          <p className="company-review-status">Loading company reviews…</p>
        ) : error ? (
          <div className="company-review-status company-review-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadReviews()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            {user?.role === "JOB_SEEKER" &&
              viewer.canReview &&
              viewer.jobTitleHeld && (
                <CompanyReviewForm
                  companyId={companyId}
                  jobTitleHeld={viewer.jobTitleHeld}
                  onSubmitted={loadReviews}
                />
              )}

            {user?.role === "JOB_SEEKER" && viewer.hasReviewed && (
              <div className="company-review-notice">
                <strong>You've reviewed this company</strong>
                <span>
                  One anonymous review is allowed per verified employee.
                </span>
              </div>
            )}

            {user?.role === "JOB_SEEKER" &&
              !viewer.canReview &&
              !viewer.hasReviewed && (
                <div className="company-review-notice">
                  <strong>Reviews are limited to verified employees</strong>
                  <span>
                    Your account needs an accepted application at this company
                    before you can submit a review.
                  </span>
                </div>
              )}

            <div className="company-review-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <CompanyReviewCard key={review.id} review={review} />
                ))
              ) : (
                <div className="company-review-empty">
                  <strong>No employee reviews yet</strong>
                  <p>
                    Verified employees can be the first to share their
                    experience.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </article>
    </section>
  );
}
