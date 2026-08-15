import { useState } from "react";
import { ApplicationModal } from "../components/JobDetail/ApplicationModal";
import { JobBodySection } from "../components/JobDetail/JobBodySection";
import { JobHero } from "../components/JobDetail/JobHero";
import { Navbar } from "../components/Navbar";

export default function JobDetailPage() {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const openApply = () => setApplyOpen(true);
  const submitApplication = () => {
    setApplied(true);
    setApplyOpen(false);
  };
  return (
    <div id="top" className="job-detail-page">
      <Navbar />
      <main>
        <JobHero
          applied={applied}
          saved={saved}
          onApply={openApply}
          onSave={() => setSaved((current) => !current)}
        />
        <JobBodySection
          applied={applied}
          saved={saved}
          onApply={openApply}
          onSave={() => setSaved((current) => !current)}
        />
      </main>
      <ApplicationModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={submitApplication}
      />
    </div>
  );
}
