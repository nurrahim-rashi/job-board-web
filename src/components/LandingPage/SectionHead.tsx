import { Reveal } from "../../hooks/useReveal";

type SectionHeadProps = { eyebrow?: string; title: string; body: string };

export function SectionHead({ eyebrow, title, body }: SectionHeadProps) {
  return (
    <Reveal className="section-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <p>{body}</p>
    </Reveal>
  );
}
