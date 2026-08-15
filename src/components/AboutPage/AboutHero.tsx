export function AboutHero() {
  return (
    <section className="about-sunrise">
      <div className="sunrise-disc">
        <i />
        <i />
      </div>
      <div className="sunrise-clouds" aria-hidden="true">
        <i className="cloud-left-one" />
        <i className="cloud-left-two" />
        <i className="cloud-right-one" />
        <i className="cloud-right-two" />
      </div>
      <svg
        className="sunrise-birds"
        aria-hidden="true"
        viewBox="0 0 120 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M0,40 Q15,25 30,40 Q45,25 60,40" />
        <path d="M40,55 Q52,42 64,55 Q76,42 88,55" />
        <path d="M70,30 Q80,20 90,30 Q100,20 110,30" />
      </svg>
      <div className="about-sunrise-copy">
        <div className="sunrise-eyebrow">
          <i />
          <span className="eyebrow">About Polaris</span>
          <i />
        </div>
        <h1>
          A job board with the
          <br />
          <span>lights turned on.</span>
        </h1>
        <p>
          Polaris is a curated job portal for talents. We believe the right role
          is easier to find when pay is clear, companies are accountable, and
          every application is treated like a person wrote it.
        </p>
      </div>
    </section>
  );
}
