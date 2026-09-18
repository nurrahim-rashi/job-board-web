import { useEffect, useState } from "react";
import { ApplicantStoriesSection } from "../components/Stories/ApplicantStoriesSection";
import { StoriesCtaSection } from "../components/Stories/StoriesCtaSection";
import { StoriesHero } from "../components/Stories/StoriesHero";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CompanyStoriesSection } from "../components/Stories/CompanyStoriesSection";
import {
  getReviewStories,
  type ReviewStoriesData,
} from "../services/review.service";
import { reviewToApplicantStory } from "../components/Stories/storiesData";

export default function StoriesPage() {
  const [data, setData] = useState<ReviewStoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    void getReviewStories()
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load stories.",
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
    <div id="top" className="stories-page">
      <Navbar />
      <main>
        <StoriesHero metrics={data?.metrics ?? null} loading={loading} />
        <ApplicantStoriesSection
          stories={(data?.reviews ?? []).map(reviewToApplicantStory)}
          loading={loading}
          error={error}
        />
        <CompanyStoriesSection
          companies={data?.companies ?? []}
          loading={loading}
          error={error}
        />
        <StoriesCtaSection />
      </main>
      <Footer />
    </div>
  );
}
