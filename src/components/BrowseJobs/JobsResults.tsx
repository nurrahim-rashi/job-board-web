import { useState } from "react";
import { ArrowRight, Bookmark, MapPin } from "../site/Icons";
import { Reveal } from "../../hooks/useReveal";
import { relativePosted, type BrowseJob } from "./jobsData";

export function JobsResults({ jobs, distances, onReset }: { jobs: BrowseJob[]; distances: Record<string, number>; onReset: () => void }) {
  const [saved, setSaved] = useState<string[]>([]);
  const toggleSaved = (slug: string) => setSaved((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  return <section className="browse-results"><div><p className="browse-count">{jobs.length} role{jobs.length === 1 ? "" : "s"} found{Object.keys(distances).length ? " · nearest to you" : ""}</p>{jobs.length ? <div className="browse-job-grid">{jobs.map((job, index) => <Reveal key={job.slug} delay={Math.min(index, 6) * 70}><article className="browse-job-card"><div className="browse-card-top"><span>{job.company[0]}</span><button type="button" aria-label={`${saved.includes(job.slug) ? "Unsave" : "Save"} ${job.title}`} onClick={() => toggleSaved(job.slug)} className={saved.includes(job.slug) ? "saved" : ""}><Bookmark /></button></div><h2>{job.title}</h2><p className="browse-company">{job.company}</p><p className="browse-location"><MapPin />{job.city}{distances[job.slug] != null ? ` · ${distances[job.slug].toFixed(0)} km` : ""}</p><div className="browse-tags">{[job.type, job.salary, job.category].map((tag) => <span key={tag}>{tag}</span>)}</div><small>{relativePosted(job.postedAt)}</small><a href={`/jobs/${job.slug}`}>View role <ArrowRight /></a></article></Reveal>)}</div> : <div className="browse-empty"><h2>No roles match those filters.</h2><button type="button" className="button button-primary" onClick={onReset}>Clear filters</button></div>}</div></section>;
}
