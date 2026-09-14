import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, MapPin, Search } from "../site/Icons";
import { Stars } from "../site/Stars";
import type { DashboardOverview } from "../../types/auth";

export function HeroSection({
  overview,
}: {
  overview: DashboardOverview | null;
  loading: boolean;
}) {
  const [location, setLocation] = useState("");

  useEffect(() => {
    setLocation(overview?.city ?? "");
  }, [overview]);

  return (
    <section className="dashboard-hero">
      <div className="night-sky" />
      <div className="night-overlay" />
      <Stars />
      <div className="dashboard-wrap">
        <p className="eyebrow light">Welcome back</p>
        <h1>
          Good to see you{overview ? `, ${overview.name}.` : "."}
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
      </div>
    </section>
  );
}
