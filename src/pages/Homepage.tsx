import { useEffect, useState } from "react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/Homepage/Hero";
import { Sidebar } from "../components/Homepage/Sidebar";
import { JobFeedSection } from "../components/Homepage/JobFeedSection";
import { getHomepageData } from "../services/auth.service";
import type { HomepageData } from "../types/auth";

export default function Homepage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomepageData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="top" className="dashboard-page">
      <Navbar />
      <main>
        <HeroSection overview={data?.overview ?? null} loading={loading} />
        <div className="dashboard-layout">
          <JobFeedSection
            recommendations={data?.recommendations ?? []}
            recommendationsLoading={loading}
          />
          <Sidebar
            applications={data?.applications ?? []}
            profileCompletion={data?.profileCompletion ?? 0}
            loading={loading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
