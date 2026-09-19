import { BadgeCheck } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import { StoryRail } from "./StoryRail";
import type { Story } from "./storiesData";

export function ApplicantStoriesSection({
  stories,
  loading,
  error,
}: {
  stories: Story[];
  loading: boolean;
  error: string;
}) {
  return (
    <section className="stories-applicants">
      <div>
        <Reveal className="stories-section-head">
          <p className="eyebrow">
            <BadgeCheck />
            Applicants
          </p>
          <h2>
            Honest experiences from people who joined teams through Polaris.
          </h2>
        </Reveal>
        <StoryRail
          id="applicant-stories"
          stories={stories}
          tone="light"
          loading={loading}
          error={error}
          emptyCopy="No verified employee stories have been published yet."
        />
      </div>
    </section>
  );
}
