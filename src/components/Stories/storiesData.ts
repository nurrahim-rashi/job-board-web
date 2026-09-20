import { formatLocation } from "../../lib/location";
import type {
  ReviewedCompanyStory,
  ReviewStory,
  ReviewStoriesData,
} from "../../services/review.service";

export type Story = {
  id: string;
  name: string;
  role: string;
  org: string;
  city: string;
  quote: string;
  stat: string;
  statLabel: string;
  initials: string;
  logo?: string | null;
  href?: string;
};

const rating = (value: number) => `${value.toFixed(1)} / 5`;

export const reviewToApplicantStory = (review: ReviewStory): Story => ({
  id: `review-${review.id}`,
  name: "Anonymous employee",
  role: review.jobTitleHeld,
  org: review.company.companyName,
  city: formatLocation(
    review.company.city,
    review.company.province,
    review.company.country,
  ),
  quote: review.reviewText,
  stat: rating(review.overallRating),
  statLabel: "verified employee rating",
  initials: "AE",
  logo: review.company.logo,
  href: `/companies/${review.company.id}`,
});

export const companyToStory = (entry: ReviewedCompanyStory): Story => ({
  id: `company-${entry.company.id}`,
  name: entry.company.companyName,
  role: `${entry.reviewCount} verified ${entry.reviewCount === 1 ? "review" : "reviews"}`,
  org: entry.latestReview.jobTitleHeld,
  city: formatLocation(
    entry.company.city,
    entry.company.province,
    entry.company.country,
  ),
  quote: entry.latestReview.reviewText,
  stat: rating(entry.averageRating),
  statLabel: "employee experience score",
  initials:
    entry.company.companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "CO",
  logo: entry.company.logo,
});

export const storyMilestones = (metrics: ReviewStoriesData["metrics"]) => [
  [metrics.matchesMade.toLocaleString("en-US"), "matches made on Polaris"],
  [
    metrics.medianDaysToOffer === null
      ? "N/A"
      : `${metrics.medianDaysToOffer.toLocaleString("en-US")} days`,
    "median application to offer",
  ],
  [
    metrics.salaryTransparencyRate === null
      ? "N/A"
      : `${metrics.salaryTransparencyRate}%`,
    "listings with a salary range",
  ],
  [
    metrics.averageReviewRating === null
      ? "N/A"
      : `${metrics.averageReviewRating.toFixed(1)} / 5`,
    `average across ${metrics.totalReviews.toLocaleString("en-US")} verified reviews`,
  ],
  [
    metrics.rejectedWithReasonRate === null
      ? "N/A"
      : `${metrics.rejectedWithReasonRate}%`,
    "rejected applications with a reason",
  ],
];
