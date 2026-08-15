import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
const questions = [
  [
    "Is Polaris free for candidates?",
    "Always. Companies pay to list; you never pay to apply, and you never see an ad.",
  ],
  [
    "How many roles go live each week?",
    "Between four and eight. We publish what passes review, never a quota.",
  ],
  [
    "Do recruiters get my details?",
    "No. Your profile stays hidden until you apply, and then only that company sees it.",
  ],
];
export function FaqSection() {
  return (
    <section id="faq" className="paper-section">
      <div className="content narrow">
        <SectionHead
          eyebrow="Help Center"
          title="Questions we get a lot"
          body="Everything else is one email away, and a person answers it."
        />
        <dl className="faq">
          {questions.map(([question, answer], index) => (
            <Reveal key={question} delay={index * 80}>
              <div>
                <dt>{question}</dt>
                <dd>{answer}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
