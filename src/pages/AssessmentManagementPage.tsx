import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  fetchDeveloperAssessments,
  createAssessment,
} from "../lib/assessment-api";

import type { DeveloperAssessment } from "../types/assessment";

export default function AssessmentManagementPage() {
  const [assessments, setAssessments] = useState<DeveloperAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDeveloperAssessments();

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

  async function handleCreateAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setCreating(true);
    setCreateError("");

    try {
      const response = await createAssessment({
        skillName: String(form.get("skillName") ?? "").trim(),
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim() || undefined,
      });

      setAssessments((current) => [
        {
          ...response.data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            questions: 0,
          },
        },
        ...current,
      ]);

      formElement.reset();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create assessment",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="workspace-dashboard">
      <Navbar />

      <main>
        <section className="role-panel">
          <div>
            <p className="eyebrow">Developer tools</p>
            <h1>Manage skill assessments</h1>
            <p>Create assessments and manage their question banks.</p>
          </div>

          <form className="profile-card" onSubmit={handleCreateAssessment}>
            <p className="eyebrow">New assessment</p>
            <h2>Create skill assessment</h2>

            <div className="profile-fields">
              <label>
                Skill name
                <input name="skillName" placeholder="e.g. React" required />
              </label>

              <label>
                Assessment title
                <input
                  name="title"
                  placeholder="e.g. React Fundamentals"
                  required
                />
              </label>

              <label className="profile-wide">
                Description
                <textarea
                  name="description"
                  placeholder="Describe what this assessment covers..."
                />
              </label>
            </div>

            {createError && <p className="profile-error">{createError}</p>}

            <button
              className="profile-submit"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create assessment"}
            </button>
          </form>

          {loading && <p>Loading assessments...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && assessments.length === 0 && (
            <article className="panel-card">
              <h2>No assessments yet</h2>
              <p>Create your first skill assessment to get started.</p>
            </article>
          )}

          {!loading && !error && assessments.length > 0 && (
            <div className="panel-grid">
              {assessments.map((assessment) => (
                <article className="panel-card" key={assessment.id}>
                  <p className="eyebrow">{assessment.skillName}</p>

                  <h2>{assessment.title}</h2>

                  {assessment.description && <p>{assessment.description}</p>}

                  <p>
                    Questions:{" "}
                    <strong>
                      {assessment._count.questions}/{assessment.questionCount}
                    </strong>
                  </p>

                  <p>
                    Passing score: <strong>{assessment.passingScore}</strong>
                  </p>

                  <p>
                    Duration:{" "}
                    <strong>{assessment.durationMinutes} minutes</strong>
                  </p>

                  <Link
                    className="button button-primary"
                    to={`/dashboard/developer/assessments/${assessment.id}`}
                  >
                    Manage questions
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
