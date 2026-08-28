import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, MapPin, Search } from "../site/Icons";
import { Stars } from "../site/Stars";
import { getDashboardOverview } from "../../services/auth.service";
import type { DashboardOverview } from "../../types/auth";

export function HeroSection() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [location, setLocation] = useState("");

  useEffect(() => {
    getDashboardOverview()
      .then((data) => {
        setOverview(data);
        setLocation(data.city ?? "");
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="dashboard-hero">
      <div className="night-sky" />
      <div className="night-overlay" />
      <Stars />
      <div className="dashboard-wrap">
        <p className="eyebrow light">Welcome back</p>
        <h1>
          Good to see you{overview ? `, ${overview.name}.` : "."}
          <br />
          <span>
            {overview
              ? `${overview.newJobs} new roles since Tuesday.`
              : "Loading your workspace…"}
          </span>
        </h1>
        <div className="dashboard-search">
          <label>
            <Search />
            <input placeholder="Job title or keyword" />
          </label>
          <label>
            <Briefcase />
            <input placeholder="Company field" />
          </label>
          <label>
            <MapPin />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Your city"
            />
          </label>
          <a href="#feed">
            Search <ArrowRight />
          </a>
        </div>
        {overview && (
          <dl>
            {overview.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
                <small>{stat.note}</small>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
