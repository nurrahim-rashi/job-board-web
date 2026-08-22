import { useState } from "react";
import { ApplicationModal } from "../components/JobDetail/ApplicationModal";
import { JobBodySection } from "../components/JobDetail/JobBodySection";
import { JobHero } from "../components/JobDetail/JobHero";
import { Navbar } from "../components/Navbar";
import { AuthModal } from "../components/site/AuthModal";
import { getStoredUser } from "../lib/auth";

export default function JobDetailPage() {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const openApply = () => {
    const user = getStoredUser();
    if (!user) {
      sessionStorage.setItem("authReturnTo", window.location.pathname);
      setAuthOpen(true);
      return;
    }
    if (!user.emailVerifiedAt) {
      window.alert("Verify your email before applying for a job. You can resend verification from your profile.");
      window.location.assign("/profile");
      return;
    }
    setApplyOpen(true);
  };
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
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
