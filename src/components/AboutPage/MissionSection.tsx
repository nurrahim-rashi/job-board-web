import { Reveal } from "../../hooks/useReveal";

export function MissionSection() {
  return (
    <section className="about-mission">
      <Reveal className="about-mission-card">
        <h2>
          We truly believe great talent deserves to be valued, and the right
          companies deserve their ideal match.
        </h2>
        <div className="about-mission-copy">
          <p>
            So we built the board we wished existed: small, curated, and brutal
            about quality. Every company answers within ten days. Every listing
            carries a real pay band. And every candidate keeps control of their
            own profile until they decide to apply.
          </p>
          <p>
            We are not trying to list every job in the world. We are trying to
            list the ones worth applying to.
          </p>{" "}
        </div>
      </Reveal>
    </section>
  );
}
