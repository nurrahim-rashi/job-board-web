import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { fetchAssessmentDetail, startAssessment } from "../lib/assessment-api";
import type { Assessment } from "../types/assessment";

export default function AssessmentDetailPage() {
  const { assessmentId } = useParams();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        if (!assessmentId) {
          throw new Error("Assessment ID is missing");
        }

        const response = await fetchAssessmentDetail(Number(assessmentId));

        setAssessment(response.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load assessment",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="workspace-dashboard">
        <Navbar />

        <main>
          <section className="role-panel">
            <p>Loading assessment...</p>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  const handleStartAssessment = async () => {
    if (!assessment) return;

    try {
      setStarting(true);
      setStartError("");

      const response = await startAssessment(assessment.id);

      navigate(`/dashboard/assessments/${assessment.id}/take`, {
        state: response.data,
      });
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : "Failed to start assessment",
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="workspace-dashboard">
      <Navbar />

      <main>
        <section className="role-panel">
          <Link to="/dashboard/assessments">← Back to assessments</Link>

          {error ? (
            <article className="panel-card">
              <h2>Unable to load assessment</h2>
              <p>{error}</p>
            </article>
          ) : assessment ? (
            <article className="panel-card">
              <p className="eyebrow">{assessment.skillName}</p>

              <h1>{assessment.title}</h1>

              {assessment.description && <p>{assessment.description}</p>}

              <div className="panel-stats">
                <article>
                  <span>Questions</span>
                  <b>{assessment.questionCount}</b>
                </article>

                <article>
                  <span>Time limit</span>
                  <b>{assessment.durationMinutes} min</b>
                </article>

                <article>
                  <span>Passing score</span>
                  <b>{assessment.passingScore}</b>
                </article>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={handleStartAssessment}
                disabled={starting}
              >
                {starting ? "Starting..." : "Start assessment"}
              </button>

              {startError && <p>{startError}</p>}
            </article>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
