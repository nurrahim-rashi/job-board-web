const rays = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * 30 * Math.PI) / 180;
  return {
    x1: 600 + Math.cos(angle) * 120,
    y1: 160 + Math.sin(angle) * 60,
    x2: 600 + Math.cos(angle) * 900,
    y2: 160 + Math.sin(angle) * 400,
    width: 1 + (index % 3) * 0.5,
  };
});

export function AboutHero() {
  return (
    <section className="about-sunrise">
      <div className="sunrise-disc">
        <i />
        <i />
      </div>
      <svg
        className="sunrise-rays"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <g>
          {rays.map((ray, index) => (
            <line
              key={index}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke="rgb(255 255 255 / .25)"
              strokeWidth={ray.width}
            />
          ))}
        </g>
      </svg>
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
        <i className="sunrise-line" />
      </div>
      <div className="sunrise-horizon" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
        </svg>
      </div>
    </section>
  );
}
