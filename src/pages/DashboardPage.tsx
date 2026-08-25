import { useState } from "react";
import { AdminPanel } from "../components/Dashboard/AdminPanel";
import { ApplicantPanel } from "../components/Dashboard/ApplicantPanel";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { DeveloperPanel } from "../components/Dashboard/DeveloperPanel";
import type { DashboardRole } from "../components/Dashboard/dashboardData";

export default function DashboardPage() {
  const [role] = useState<DashboardRole>("applicant");
  return (
    <div className="workspace-dashboard">
      <Navbar />
      <main>
        {role === "applicant" && <ApplicantPanel />}
        {role === "admin" && <AdminPanel />}
        {role === "developer" && <DeveloperPanel />}
      </main>
      <Footer />
    </div>
  );
}
