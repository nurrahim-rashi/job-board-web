import { Stars } from "../site/Stars";
import { milestones } from "./storiesData";
export function StoriesHero() {
  return (
    <section className="stories-hero">
      <Stars />
      <i className="stories-aurora" />
      <div>
        <p className="eyebrow light">Stories</p>
        <h1>
          The right fit,
          <br />
          <span>told by the people who found it.</span>
        </h1>
        <p>
          Every match on Polaris has two sides. Here are the applicants who
          stopped shouting into the void, and the teams who stopped reading
          three hundred CVs to find one person.
        </p>
        <dl>
          {milestones.map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
