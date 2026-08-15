import { Play } from "../site/Icons";
import { Stars } from "../site/Stars";
import { Reveal } from "../../hooks/useReveal";
import { SectionHead } from "./SectionHead";
const placements = [
  ["Head of Design", "Wren", "22 people", "17 days"],
  ["Backend Engineer", "Tidewell", "6 people", "9 days"],
  ["Product Manager", "Kessel", "40 people", "24 days"],
];
export function RecentWorkSection() {
  return (
    <section className="paper-section">
      <div className="content">
        <SectionHead
          eyebrow="Recent work"
          title="What we’ve been closing"
          body="Small moments from searches we ran lately, and how long each one actually took."
        />
        <Reveal>
          <div className="reel">
            <div>
              <Stars />
              <button>
                <Play /> hiring_reel_2026.mp4
              </button>
            </div>
            <ul>
              {placements.map(([role, company, size, days]) => (
                <li key={role}>
                  <b>{role}</b>
                  <span>{company}</span>
                  <span>{size}</span>
                  <em>filled in {days}</em>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
