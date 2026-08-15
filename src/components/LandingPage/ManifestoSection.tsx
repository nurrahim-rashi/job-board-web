import { Reveal } from "../../hooks/useReveal";

export const beliefs = [
  "In a job market full of noise, we act as your steady compass to cut through the chaos and find work that truly matters.",
  "Every single listing is vetted by hand, ensuring clear pay, real scope, and zero guesswork before it ever reaches your screen.",
  "No more screaming into the void or ghost applications; we hold companies accountable so you always get a real response.",
  "We also ensure your career path stays strictly under your control, free from data-selling brokers and unwanted spam until you decide to make a move.",
  "We are here to guide you steadily toward a place where your skills and time are genuinely respected.",
];

export function ManifestoSection() {
  return (
    <section className="dawn-section">
      <Reveal className="manifesto-reveal">
        <div className="manifesto">
          <h2>We help you navigate the job market with confidence.</h2>
          <div>
            {beliefs.map((belief, index) => (
              <Reveal key={belief} delay={index * 70}>
                <p>{belief}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
