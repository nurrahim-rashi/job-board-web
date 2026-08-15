import { ArrowRight } from "../site/Icons";
import { Stars } from "../site/Stars";

const latestRoles = [
  ["Senior Product Designer", "Fieldnote · Berlin / Remote EU · €85–105k"],
  ["Staff iOS Engineer", "Halden Labs · Remote · $170–200k"],
  ["Backend Engineer", "Tidewell · Lisbon · €70–90k"],
  ["Product Manager", "Kessel · Amsterdam · €80–95k"],
  ["Head of Design", "Wren · Remote UK · £95–115k"],
];

export function HeroSection() {
  return (
    <section className="hero-night">
      <div className="night-sky" />
      <div className="night-overlay" />
      <Stars />
      <div className="hero-wrap">
        <div className="hero-copy">
          <h1>
            Five new roles.
            <br />
            Every Monday.
          </h1>
          <p className="hero-lede">
            A curated job portal with hand-read listings, honest pay bands, and
            companies that actually answer.
          </p>
          <div className="hero-actions">
            <a className="button button-light" href="#roles">
              Browse jobs
            </a>
            <a className="button button-outline" href="#services">
              I&rsquo;m hiring <ArrowRight />
            </a>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>Reply guarantee</dt>
              <dd>10 working days</dd>
            </div>
            <div>
              <dt>Live listings</dt>
              <dd>62</dd>
            </div>
            <div>
              <dt>Pay bands shown</dt>
              <dd>100%</dd>
            </div>
          </dl>
        </div>
        <div className="latest-drop float-slow">
          <div className="drop-title">
            <span>Latest drop</span>
          </div>
          <ul>
            {latestRoles.map(([role, detail]) => (
              <li key={role}>
                <a href="#roles">
                  <span>
                    <b>{role}</b>
                    <small>{detail}</small>
                  </span>
                  <ArrowRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
