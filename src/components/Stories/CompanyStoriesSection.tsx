import { Building } from "../site/Icons";
import { Stars } from "../site/Stars";
import { Reveal } from "../../hooks/useReveal";
import { StoryRail } from "./StoryRail";
import { companyStories } from "./storiesData";
export function CompanyStoriesSection() {
  return (
    <section className="stories-companies">
      <Stars />
      <div>
        <Reveal className="stories-section-head">
          <p className="eyebrow">
            <Building />
            Companies
          </p>
          <h2>
            Hiring teams who stopped guessing and started meeting the right
            five.
          </h2>
        </Reveal>
        <StoryRail id="company-stories" stories={companyStories} tone="dark" />
      </div>
    </section>
  );
}
