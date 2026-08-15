import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
const reviews = [
  [
    "I applied to three roles here and heard back from all three within a week. After eight months of silence elsewhere, that alone was worth it.",
    "The role summaries actually tell you what the job is. Salary, team size, who you report to, what the first ninety days look like.",
    "Got hired at a nine-person studio I'd never have found otherwise. Two rounds, clear feedback, offer in eleven days.",
    "No recruiter spam. Not one. I still don't know how they manage it, but my inbox thanks them.",
  ],
  [
    "I used the salary ranges to renegotiate at my current job instead of leaving. Polaris was fine with that, which says a lot.",
    "As a hiring manager: fewer applicants, dramatically better ones. We filled a staff role in three weeks.",
    "The weekly drop is the only newsletter I open. Six roles, hand-written notes, no filler.",
    "Career-changer here. Their guidance on framing prior experience got me my first product job at 38.",
  ],
];
export function TestimonialsSection() {
  return (
    <section id="stories" className="testimonials">
      <SectionHead
        eyebrow="Testimonials"
        title="Stories from those who found their true north with Polaris"
        body=""
      />
      <div className="marquees">
        {reviews.map((row, rowIndex) => (
          <div
            className={`marquee ${rowIndex ? "reverse" : ""}`}
            key={rowIndex}
          >
            {[...row, ...row, ...row].map((review, index) => (
              <figure key={`${review}-${index}`}>
                <i>★★★★★</i>
                <blockquote>{review}</blockquote>
                <figcaption>Hired through Polaris</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>{" "}
      <Reveal className="benefits-cta" delay={120}>
        <a className="button button-primary" href="/stories">
          View more stories
        </a>
      </Reveal>
    </section>
  );
}
