import { MapPin } from "../site/Icons";
import { JobsBoardHero } from "../site/JobsBoardHero";

type BrowseHeroProps = {
  locating: boolean;
  located: boolean;
  onLocate: () => void;
};

export function BrowseHero({ locating, located, onLocate }: BrowseHeroProps) {
  return (
    <JobsBoardHero>
      <div className="browse-jobs-hero-copy">
        <p className="eyebrow light">All jobs</p>
        <h1>
          Best job listings
          <br />
          <span>
            {located
              ? "sorted by distance from you."
              : "freshest listings first."}
          </span>
        </h1>
        <button type="button" onClick={onLocate}>
          <MapPin />
          {locating
            ? "Locating…"
            : located
              ? "Refresh my location"
              : "Use my location"}
        </button>
      </div>
    </JobsBoardHero>
  );
}
