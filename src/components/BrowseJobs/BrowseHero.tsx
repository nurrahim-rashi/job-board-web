import { MapPin } from "../site/Icons";
import { Stars } from "../site/Stars";

type BrowseHeroProps = {
  locating: boolean;
  located: boolean;
  onLocate: () => void;
};

export function BrowseHero({ locating, located, onLocate }: BrowseHeroProps) {
  return (
    <section className="browse-hero">
      <Stars />
      <div>
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
    </section>
  );
}
