import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
import {
  getReviewStories,
  type ReviewStory,
} from "../../services/review.service";

const VISIBLE_REVIEWS = 6;

function TestimonialCard({ review }: { review: ReviewStory }) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const quote = quoteRef.current;
    if (!quote) return;

    const measure = () => {
      if (expanded) return;
      setClamped(quote.scrollHeight > quote.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(quote);
    return () => observer.disconnect();
  }, [review.reviewText, expanded]);

  const rounded = Math.round(review.overallRating);

  return (
    <figure className={`testimonial-card ${expanded ? "expanded" : ""}`}>
      <i aria-label={`${rounded} out of 5`}>
        {"★".repeat(rounded)}
        {"☆".repeat(5 - rounded)}
      </i>
      <blockquote ref={quoteRef}>{review.reviewText}</blockquote>
      {(clamped || expanded) && (
        <button
          className="testimonial-card-toggle"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
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

  return (
    <section id="stories" className="testimonials">
      <SectionHead
        eyebrow="Testimonials"
        title="Verified company stories from people who worked there"
        body="Every review comes from a job seeker with an accepted Polaris application. Identities stay anonymous; the experience stays honest."
      />
      {loading ? (
        <div className="testimonial-grid">
          {Array.from({ length: VISIBLE_REVIEWS }, (_, index) => (
            <figure
              className="testimonial-card testimonial-card-skeleton"
              key={index}
              aria-hidden="true"
            >
              <i />
              <span />
              <span />
              <span />
              <small />
            </figure>
          ))}
        </div>
      ) : error ? (
        <div className="testimonial-state">
          <strong>Company reviews could not be loaded.</strong>
          <p>{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="testimonial-state">
          <strong>No verified reviews yet.</strong>
          <p>The first employee story will appear here after it is submitted.</p>
        </div>
      ) : (
        <div className="testimonial-grid">
          {reviews.map((review) => (
            <TestimonialCard key={review.id} review={review} />
          ))}
        </div>
      )}
      <Reveal className="benefits-cta" delay={120}>
        <a className="button button-primary" href="/stories">
          View more stories
        </a>
      </Reveal>
    </section>
  );
}
