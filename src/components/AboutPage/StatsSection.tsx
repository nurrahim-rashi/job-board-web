import { Reveal } from "../../hooks/useReveal";
const stats = [["Live roles", "62"], ["Companies listed", "18"], ["Average time to reply", "4.2 days"], ["Pay bands shown", "100%"]];
export function StatsSection() { return <section className="about-stats"><Reveal className="about-section-head"><p className="eyebrow">Where we are now</p><h2>Small numbers, high standards.</h2></Reveal><div>{stats.map(([label, value], index) => <Reveal key={label} delay={index * 80}><article><b>{value}</b><p>{label}</p></article></Reveal>)}</div></section>; }
