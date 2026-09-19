import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ReviewedCompanyStory } from "../../services/review.service";
import { formatLocation } from "../../lib/location";
import { Reveal } from "../../hooks/useReveal";
import { ArrowLeft, ArrowRight, BadgeCheck, Building, Star } from "../site/Icons";
import { Stars } from "../site/Stars";
import { hasTopTierQuality } from "../../lib/quality";

export function CompanyStoriesSection({ companies, loading, error }: {
  companies: ReviewedCompanyStory[];
  loading: boolean;
  error: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) =>
    railRef.current?.scrollBy({ left: direction * 440, behavior: "smooth" });
  return (
    <section className="stories-companies">
      <Stars />
      <div>
        <Reveal className="stories-section-head">
          <p className="eyebrow">
            <Building />
            Reliable company partners
          </p>
          <h2>
            Companies held to a higher standard of reliability, quality, and
            integrity.
          </h2>
          <p>Quality scores combine real hiring behavior, job transparency, and verified employee experience—so every partnership earns trust.</p>
        </Reveal>
        <div className="company-trust-rail">
          <div className="story-rail-actions">
            <button type="button" aria-label="Scroll companies left" disabled={loading || companies.length === 0} onClick={() => scroll(-1)}><ArrowLeft /></button>
            <button type="button" aria-label="Scroll companies right" disabled={loading || companies.length === 0} onClick={() => scroll(1)}><ArrowRight /></button>
          </div>
          <div ref={railRef} className="company-trust-track">
            {loading ? Array.from({ length: 3 }, (_, index) => (
              <article className="company-trust-card is-loading" key={index}><i /><span /><span /><span /><span /></article>
            )) : error ? (
              <article className="story-rail-state"><strong>Company quality data could not be loaded</strong><p>{error}</p></article>
            ) : companies.length === 0 ? (
              <article className="story-rail-state"><strong>No verified company stories yet</strong><p>Company quality and reviews will appear after the first verified employee review.</p></article>
            ) : companies.map((entry) => <CompanyTrustCard key={entry.company.id} entry={entry} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyTrustCard({ entry }: { entry: ReviewedCompanyStory }) {
  const navigate = useNavigate();
  const initials = entry.company.companyName.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "CO";
  return (
    <article
      className="company-trust-card company-trust-card-clickable"
      role="link"
      tabIndex={0}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, button, details, summary")) return;
        navigate(`/companies/${entry.company.id}`);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/companies/${entry.company.id}`);
        }
      }}
    >
      <header>
        <i className="company-trust-logo">{entry.company.logo ? <img src={entry.company.logo} alt="" /> : initials}</i>
        <div>
          <Link to={`/companies/${entry.company.id}`}>
            {entry.company.companyName}
            {entry.company.verified && <BadgeCheck aria-label="Verified company email" />}
          </Link>
          <p>{formatLocation(entry.company.city, entry.company.province, entry.company.country)}</p>
        </div>
        <strong>{entry.quality.score}%</strong>
      </header>
      <div className="company-trust-summary">
        {hasTopTierQuality(entry.quality.score) && (
          <span className="top-tier-company-badge">💎 Top Tier Company</span>
        )}
        <span className="company-star-rating" aria-label={`${entry.averageRating} out of 5 stars`}>
          <i>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={index < Math.round(entry.averageRating) ? "filled" : ""} />)}</i>
          {entry.averageRating.toFixed(1)}
        </span>
        <span>{entry.reviewCount} verified {entry.reviewCount === 1 ? "review" : "reviews"}</span>
        <span>{entry.verifiedSkillHires} {entry.verifiedSkillHires === 1 ? "hire" : "hires"} with role-relevant skill badges</span>
      </div>
      <details className="company-quality-breakdown">
        <summary>Company quality score breakdown</summary>
        <ul>{entry.quality.metrics.map((metric) => (
          <li key={metric.key}><span><b>{metric.label}</b><small>{metric.explanation}</small></span><strong>{metric.display}</strong></li>
        ))}</ul>
      </details>
      <div className="company-latest-reviews">
        <h3>Latest verified reviews</h3>
        {entry.latestReviews.map((review) => (
          <Link key={review.id} to={`/companies/${entry.company.id}`}>
            <span><b>{review.jobTitleHeld}</b><small><Star /> {review.overallRating.toFixed(1)}</small></span>
            <p>{review.reviewText}</p>
          </Link>
        ))}
      </div>
      <Link className="company-trust-profile-link" to={`/companies/${entry.company.id}`}>View company profile <ArrowRight /></Link>
    </article>
  );
}
