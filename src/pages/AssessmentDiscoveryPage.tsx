import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import { fetchAssessments } from "../lib/assessment-api";
import type { Assessment } from "../types/assessment";

export default function AssessmentDiscoveryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const response = await fetchAssessments();

        setAssessments(response.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load assessments",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, []);

  return (
    <div className="workspace-dashboard seeker-dashboard-overview">
      <Navbar />

      <main>
        <SeekerDashboardHero />

        <SeekerDashboardShell>
          <section className="role-panel">
            <div>
              <p className="eyebrow">Skill assessments</p>
              <h1>Test your skills</h1>
              <p>
                Complete an assessment to demonstrate your skills and earn a
                badge for your profile.
              </p>
            </div>

            {loading ? (
              <p>Loading assessments...</p>
            ) : error ? (
              <article className="panel-card">
                <h2>Unable to load assessments</h2>
                <p>{error}</p>
              </article>
            ) : assessments.length === 0 ? (
              <article className="panel-card">
                <h2>No assessments available</h2>
                <p>Check back later for new skill assessments.</p>
              </article>
            ) : (
              <div className="panel-grid">
                {assessments.map((assessment) => (
                  <article className="panel-card" key={assessment.id}>
                    <p className="eyebrow">{assessment.skillName}</p>

                    <h2>{assessment.title}</h2>

                    {assessment.description && <p>{assessment.description}</p>}

                    <div>
                      <small>{assessment.questionCount} questions</small>

                      <small>
                        {" • "}
                        {assessment.durationMinutes} minutes
                      </small>

                      <small>
                        {" • "}
                        Pass: {assessment.passingScore}
                      </small>
                    </div>

                    <Link to={`/dashboard/assessments/${assessment.id}`}>
                      View assessment →
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </SeekerDashboardShell>
      </main>

      <Footer />
    </div>
  );
}
