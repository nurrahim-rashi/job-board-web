import { useEffect, useState } from "react";
import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
import {
  getReviewStories,
  type ReviewStory,
} from "../../services/review.service";

const VISIBLE_REVIEWS = 10;

function TestimonialCard({
  review,
  cloned,
}: {
  review: ReviewStory;
  cloned?: boolean;
}) {
  const rounded = Math.round(review.overallRating);

  return (
    <figure className="testimonial-card" aria-hidden={cloned || undefined}>
      <i aria-label={cloned ? undefined : `${rounded} out of 5`}>
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </i>
      <blockquote>{review.reviewText}</blockquote>
      <figcaption>
        Anonymous {review.jobTitleHeld} · {review.company.companyName}
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<ReviewStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getReviewStories()
      .then((data) => {
        if (cancelled) return;
        const seenIds = new Set<number>();
        const seenQuotes = new Set<string>();
        const unique: ReviewStory[] = [];

        for (const review of data.reviews) {
          const quoteKey = `${review.company.id}::${review.reviewText.trim().toLowerCase()}`;
          if (seenIds.has(review.id) || seenQuotes.has(quoteKey)) continue;
          seenIds.add(review.id);
          seenQuotes.add(quoteKey);
          unique.push(review);
          if (unique.length === VISIBLE_REVIEWS) break;
        }

        setReviews(unique);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load company reviews.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Two rows moving in opposite directions. Each row is tripled because the
  // track animates by exactly one third of its width, which is what makes the
  // loop seamless; the extra passes are clones, hidden from assistive tech.
  const rows = reviews.length
    ? [
        reviews.filter((_, index) => index % 2 === 0),
        reviews.filter((_, index) => index % 2 === 1),
      ].filter((row) => row.length > 0)
    : [];

  return (
    <section id="stories" className="testimonials">
      <SectionHead
        eyebrow="Testimonials"
        title="Verified company stories from people who worked there"
        body="Every review comes from a job seeker with an accepted Polaris application. Identities stay anonymous; the experience stays honest."
      />
      <div className="marquees">
        {loading ? (
          Array.from({ length: 2 }, (_, rowIndex) => (
            <div className="marquee testimonial-skeleton-row" key={rowIndex}>
              {Array.from({ length: 4 }, (_, index) => (
                <figure
                  className="testimonial-card testimonial-card-skeleton"
                  key={index}
                  aria-hidden="true"
                >
                  <i />
                  <span />
                  <span />
                  <small />
                </figure>
              ))}
            </div>
          ))
        ) : error ? (
          <div className="testimonial-state">
            <strong>Company reviews could not be loaded.</strong>
            <p>{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="testimonial-state">
            <strong>No verified reviews yet.</strong>
            <p>
              The first employee story will appear here after it is submitted.
            </p>
          </div>
        ) : (
          rows.map((row, rowIndex) => (
            <div
              className={`marquee ${rowIndex ? "reverse" : ""}`}
              key={rowIndex}
            >
              {[0, 1, 2].map((pass) =>
                row.map((review) => (
                  <TestimonialCard
                    key={`${pass}-${review.id}`}
                    review={review}
                    cloned={pass > 0}
                  />
                )),
              )}
            </div>
          ))
        )}
      </div>
      <Reveal className="benefits-cta" delay={120}>
        <a className="button button-primary" href="/stories">
          View more stories
        </a>
      </Reveal>
    </section>
  );
}
