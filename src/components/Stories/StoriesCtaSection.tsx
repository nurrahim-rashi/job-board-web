import { ArrowRight } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
export function StoriesCtaSection() {
  return (
    <section className="stories-cta-section">
      <Reveal>
        <div>
          <i />
          <h2>Your story might be the next interesting one.</h2>
          <p>
            Start with one search, one honest salary range, one application you
            actually hear back from. Then tell us how it went — we publish the
            good ones here.
          </p>
          <aside>
            <a className="button button-primary" href="/jobs">
              Find your fit <ArrowRight />
            </a>
            <a className="stories-cta-secondary" href="/companies">
              Browse companies
            </a>
          </aside>
          <small>Searching and applying is free, always.</small>
        </div>
      </Reveal>
    </section>
  );
}
