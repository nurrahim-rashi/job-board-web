import { useEffect, useRef, useState } from "react";
import { Stars } from "../site/Stars";

type TrackName = "applicants" | "companies";
type Step = { label: string; time: string; title: string; body: string; x: number; y: number };

const tracks: Record<TrackName, { name: string; steps: Step[] }> = {
  applicants: { name: "For applicants", steps: [
    { label: "Day 0", time: "2 min", title: "Apply in one tap", body: "Your Polaris profile and CV travel with you. No retyping your work history into another portal.", x: 8, y: 68 },
    { label: "Day 0", time: "instant", title: "Read by a human", body: "Every application lands in a real inbox. Matching only ranks it — it never rejects you.", x: 30, y: 26 },
    { label: "Day 2", time: "48 hrs", title: "First answer", body: "Yes, no, or not yet — within two working days. Silence is not an option on Polaris.", x: 52, y: 62 },
    { label: "Day 5", time: "1 week", title: "Talk to the team", body: "Pre-selection test and interviews scheduled from one page, with the pay band already on the table.", x: 74, y: 22 },
    { label: "Day 10", time: "10 days", title: "Offer signed", body: "Median time from apply to signed offer across roles filled on Polaris this year.", x: 93, y: 55 },
  ] },
  companies: { name: "For companies", steps: [
    { label: "Hour 1", time: "20 min", title: "Post the role", body: "Write it once with our scoping prompts. Vague pay or scope never reaches the board.", x: 8, y: 30 },
    { label: "Hour 6", time: "6 hrs", title: "Live and matched", body: "Your listing goes out to profiles that actually fit — location, stack, salary range.", x: 29, y: 66 },
    { label: "Day 3", time: "72 hrs", title: "Shortlist ready", body: "A curated set of candidates with test results attached, not four hundred random clicks.", x: 51, y: 24 },
    { label: "Day 7", time: "1 week", title: "Interviews done", body: "Scheduling, scorecards and analytics on drop-off live in one dashboard.", x: 73, y: 60 },
    { label: "Day 12", time: "12 days", title: "Hire closed", body: "Average time-to-hire for small teams using Polaris end to end.", x: 93, y: 28 },
  ] },
};

export function HiringConstellation() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [track, setTrack] = useState<TrackName>("applicants");
  const [progress, setProgress] = useState(0);
  const steps = tracks[track].steps;
  const drawn = progress * (steps.length - 1);
  const active = Math.min(steps.length - 1, Math.round(drawn));
  const updateProgress = (value: number) => { const next = Math.min(1, Math.max(0, value)); progressRef.current = next; setProgress(next); };

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const isActiveSection = rect.top <= window.innerHeight * 0.15 && rect.bottom >= window.innerHeight * 0.85;
      if (!isActiveSection) return;
      const delta = event.deltaX || event.deltaY;
      const current = progressRef.current;
      const canExit = (current <= 0 && delta < 0) || (current >= 1 && delta > 0);
      if (delta === 0 || canExit) return;
      event.preventDefault();
      if (Math.abs(rect.top) > 1) window.scrollTo({ top: section.offsetTop, behavior: "auto" });
      updateProgress(current + delta / 1500);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const switchTrack = (next: TrackName) => { setTrack(next); updateProgress(0); };
  const goToStep = (index: number) => updateProgress(index / (steps.length - 1));

  return <section id="speed" ref={sectionRef} className="hiring-constellation"><div className="constellation-sticky"><div className="constellation-stars"><Stars /></div><div className="constellation-content"><header><div><p className="eyebrow light">How fast it moves</p><h2>Hiring, plotted like a constellation</h2></div><div className="constellation-tabs">{(Object.keys(tracks) as TrackName[]).map((name) => <button key={name} type="button" className={track === name ? "active" : ""} onClick={() => switchTrack(name)}>{tracks[name].name}</button>)}</div></header><div className="constellation-map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{steps.slice(0, -1).map((step, index) => { const next = steps[index + 1]!; const segment = Math.min(1, Math.max(0, drawn - index)); return <g key={`${track}-${index}`}><line x1={step.x} y1={step.y} x2={next.x} y2={next.y} className="constellation-line" /><line x1={step.x} y1={step.y} x2={step.x + (next.x - step.x) * segment} y2={step.y + (next.y - step.y) * segment} className="constellation-drawn" /></g>; })}</svg>{steps.map((step, index) => { const reached = drawn >= index - 0.001; const isCurrent = index === active; return <button key={`${track}-${step.title}`} type="button" className={`constellation-point ${reached ? "reached" : ""} ${isCurrent ? "active" : ""}`} style={{ left: `${step.x}%`, top: `${step.y}%` }} onClick={() => goToStep(index)} aria-label={`${step.label} — ${step.title}`}><i /><span>{step.label}</span></button>; })}</div><div className="constellation-copy">{steps.map((step, index) => <article key={`${track}-${step.title}`} className={index === active ? "active" : ""}><b>{step.time}</b><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}</div><div className="constellation-progress"><i style={{ width: `${progress * 100}%` }} /></div></div></div></section>;
}
