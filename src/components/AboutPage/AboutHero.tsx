import { Stars } from "../site/Stars";
export function AboutHero() {
  return (
    <section className="about-hero">
      <div className="night-sky" />
      <Stars />
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <i className="north-star">✦</i>
      <div className="about-hero-copy">
        <p className="eyebrow light">About Us</p>
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
        <i className="hero-line" />
      </div>
      <div className="about-wave" />
    </section>
  );
}
