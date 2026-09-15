import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";

import { fetchAssessmentResults } from "../lib/assessment-api";

import type { AssessmentResultSummary } from "../types/assessment";

export default function AssessmentResultsPage() {
  const [results, setResults] = useState<AssessmentResultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchAssessmentResults();

        setResults(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load assessment results",
        );
      } finally {
        setLoading(false);
      }
    };

    loadResults();
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
              <h1>Assessment history</h1>
              <p>Review your previous skill assessment attempts.</p>
            </div>

            {loading && <p>Loading assessment history...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && results.length === 0 && (
              <article className="panel-card">
                <h2>No assessment results yet</h2>

                <p>
                  Complete a skill assessment and your results will appear here.
                </p>

                <Link
                  className="button button-primary"
                  to="/dashboard/assessments"
                >
                  Browse assessments
                </Link>
              </article>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="panel-grid">
                {results.map((result) => (
                  <article className="panel-card" key={result.resultId}>
                    <p className="eyebrow">{result.skillName}</p>

                    <h2>{result.title}</h2>

                    <p>
                      Score: <strong>{result.score}</strong>
                    </p>

                    <p>
                      Result:{" "}
                      <strong>{result.isPassed ? "PASS" : "FAIL"}</strong>
                    </p>

                    {result.badgeName && (
                      <p>
                        Badge: <strong>{result.badgeName}</strong>
                      </p>
                    )}

                    {result.completedAt && (
                      <p>
                        Completed:{" "}
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    )}

                    <Link
                      className="button button-primary"
                      to={`/dashboard/assessments/results/${result.resultId}`}
                    >
                      View result
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
