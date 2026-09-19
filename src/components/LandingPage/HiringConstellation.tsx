import { useEffect, useRef, useState } from "react";
import { Stars } from "../site/Stars";

type TrackName = "applicants" | "companies";
type Step = {
  label: string;
  time: string;
  title: string;
  body: string;
  x: number;
  y: number;
};

const tracks: Record<TrackName, { name: string; steps: Step[] }> = {
  applicants: {
    name: "For applicants",
    steps: [
      {
        label: "Day 0",
        time: "2 min",
        title: "Submit your application",
        body: "Send your profile and CV to the company for review.",
        x: 8,
        y: 68,
      },
      {
        label: "Day 1–3",
        time: "1–3 days",
        title: "Initial review",
        body: "The company reviews your application and decides the next step.",
        x: 30,
        y: 26,
      },
      {
        label: "Day 3–6",
        time: "Up to 3 days",
        title: "Complete pre-selection",
        body: "Take the assigned pre-selection test when the role requires one.",
        x: 52,
        y: 62,
      },
      {
        label: "Day 5–10",
        time: "3–7 days",
        title: "Interview stage",
        body: "Meet the hiring team using the schedule and location they provide.",
        x: 74,
        y: 22,
      },
      {
        label: "Day 7–14",
        time: "2–5 days",
        title: "Final decision",
        body: "Receive the company’s final application decision after the interview.",
        x: 93,
        y: 55,
      },
    ],
  },
  companies: {
    name: "For companies",
    steps: [
      {
        label: "Hour 1",
        time: "20 min",
        title: "Post the role",
        body: "Complete the role details and publish the job for applicants.",
        x: 8,
        y: 30,
      },
      {
        label: "Day 1",
        time: "Within 24 hrs",
        title: "Review new applicants",
        body: "Open incoming applications and check each candidate’s profile and CV.",
        x: 29,
        y: 66,
      },
      {
        label: "Day 3",
        time: "2–5 days",
        title: "Move qualified candidates",
        body: "Assign a test when needed and advance suitable applicants.",
        x: 51,
        y: 24,
      },
      {
        label: "Day 7",
        time: "3–7 days",
        title: "Schedule interviews",
        body: "Set the interview time and location or meeting link for each candidate.",
        x: 73,
        y: 60,
      },
      {
        label: "Day 7–14",
        time: "2–5 days",
        title: "Close with a decision",
        body: "Accept or reject the applicant and complete the hiring process.",
        x: 93,
        y: 28,
      },
    ],
  },
};

export function HiringConstellation() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [track, setTrack] = useState<TrackName>("applicants");
  const [progress, setProgress] = useState(0);
  const steps = tracks[track].steps;
  const drawn = progress * (steps.length - 1);
  const active = Math.min(steps.length - 1, Math.round(drawn));
  const updateProgress = (value: number) => {
    const next = Math.min(1, Math.max(0, value));
    progressRef.current = next;
    setProgress(next);
  };

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const isActiveSection =
        rect.top <= window.innerHeight * 0.15 &&
        rect.bottom >= window.innerHeight * 0.85;
      if (!isActiveSection) return;
      const delta = event.deltaX || event.deltaY;
      const current = progressRef.current;
      const canExit =
        (current <= 0 && delta < 0) || (current >= 1 && delta > 0);
      if (delta === 0 || canExit) return;
      event.preventDefault();
      if (Math.abs(rect.top) > 1)
        window.scrollTo({ top: section.offsetTop, behavior: "auto" });
      updateProgress(current + delta / 1500);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const switchTrack = (next: TrackName) => {
    setTrack(next);
    updateProgress(0);
  };
  const goToStep = (index: number) =>
    updateProgress(index / (steps.length - 1));

  return (
    <section id="speed" ref={sectionRef} className="hiring-constellation">
      <div className="constellation-sticky">
        <div className="constellation-stars">
          <Stars />
        </div>
        <div className="constellation-content">
          <header>
            <div>
              <p className="eyebrow light">How fast it moves</p>
              <h2>Hiring, plotted like a constellation</h2>
            </div>
            <div className="constellation-tabs">
              {(Object.keys(tracks) as TrackName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  className={track === name ? "active" : ""}
                  onClick={() => switchTrack(name)}
                >
                  {tracks[name].name}
                </button>
              ))}
            </div>
          </header>
          <div className="constellation-map">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {steps.slice(0, -1).map((step, index) => {
                const next = steps[index + 1]!;
                const segment = Math.min(1, Math.max(0, drawn - index));
                return (
                  <g key={`${track}-${index}`}>
                    <line
                      x1={step.x}
                      y1={step.y}
                      x2={next.x}
                      y2={next.y}
                      className="constellation-line"
                    />
                    <line
                      x1={step.x}
                      y1={step.y}
                      x2={step.x + (next.x - step.x) * segment}
                      y2={step.y + (next.y - step.y) * segment}
                      className="constellation-drawn"
                    />
                  </g>
                );
              })}
            </svg>
            {steps.map((step, index) => {
              const reached = drawn >= index - 0.001;
              const isCurrent = index === active;
              return (
                <button
                  key={`${track}-${step.title}`}
                  type="button"
                  className={`constellation-point ${reached ? "reached" : ""} ${isCurrent ? "active" : ""}`}
                  style={{ left: `${step.x}%`, top: `${step.y}%` }}
                  onClick={() => goToStep(index)}
                  aria-label={`${step.time} — ${step.title}`}
                >
                  <i />
                  <span>{step.time}</span>
                </button>
              );
            })}
          </div>
          <div className="constellation-copy">
            {steps.map((step, index) => (
              <article
                key={`${track}-${step.title}`}
                className={index === active ? "active" : ""}
              >
                <b>{step.time}</b>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="constellation-progress">
            <i style={{ width: `${progress * 100}%` }} />
          </div>
          <nav className="constellation-mobile-controls" aria-label="Hiring process steps">
            <button
              type="button"
              onClick={() => goToStep(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Previous hiring step"
            >
              ←
            </button>
            <div className="constellation-mobile-slider">
              <input
                type="range"
                min="0"
                max={steps.length - 1}
                step="1"
                value={active}
                onChange={(event) => goToStep(Number(event.target.value))}
                aria-label="Hiring process step"
                aria-valuetext={`${steps[active].time}: ${steps[active].title}`}
              />
              <span>{active + 1} / {steps.length}</span>
            </div>
            <button
              type="button"
              onClick={() => goToStep(Math.min(steps.length - 1, active + 1))}
              disabled={active === steps.length - 1}
              aria-label="Next hiring step"
            >
              →
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
}
