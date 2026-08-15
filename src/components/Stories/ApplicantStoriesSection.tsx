import { BadgeCheck } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import { StoryRail } from "./StoryRail";
import { applicantStories } from "./storiesData";
export function ApplicantStoriesSection() {
  return (
    <section className="stories-applicants">
      <div>
        <Reveal className="stories-section-head">
          <p className="eyebrow">
            <BadgeCheck />
            Applicants
          </p>
          <h2>
            They found work that actually fit — not just work that was
            available.
          </h2>
        </Reveal>
        <StoryRail
          id="applicant-stories"
          stories={applicantStories}
          tone="light"
        />
      </div>
    </section>
  );
}
