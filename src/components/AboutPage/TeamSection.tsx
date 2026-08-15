import { Reveal } from "../../hooks/useReveal";
const team = [
  {
    name: "Rashifa",
    role: "Co-founder & Product",
    bio: "Former product designer, now reads every listing and argues about salary transparency.",
  },
  {
    name: "Nanda",
    role: "Co-founder & Engineering",
    bio: "Builds the ranking and reply-tracking systems that keep the ten-day promise honest.",
  },
  {
    name: "Prima",
    role: "Co-founder & Operations",
    bio: "Talks to companies, screens postings, and makes sure candidates get real answers.",
  },
];
export function TeamSection() {
  return (
    <section className="about-team">
      <Reveal className="about-section-head">
        <p className="eyebrow">The team</p>
        <h2>Three people, one inbox.</h2>
        <p>
          We read the listings, answer the emails, and write the code. No sales
          team, no recruiters, no middlemen.
        </p>
      </Reveal>
      <div>
        {team.map((person, index) => (
          <Reveal key={person.name} delay={index * 90}>
            <article>
              <b>{person.name[0]}</b>
              <h3>{person.name}</h3>
              <strong>{person.role}</strong>
              <p>{person.bio}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
