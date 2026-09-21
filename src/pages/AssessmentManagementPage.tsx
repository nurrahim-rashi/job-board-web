import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { DeveloperShell } from "../components/Developer/DeveloperShell";
import {
  createAssessment,
  fetchDeveloperAssessments,
  publishAssessment,
} from "../lib/assessment-api";
import type { DeveloperAssessment } from "../types/assessment";

export default function AssessmentManagementPage() {
  const [assessments, setAssessments] = useState<DeveloperAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [publishingAssessmentId, setPublishingAssessmentId] = useState<
    number | null
  >(null);
  const [publishError, setPublishError] = useState("");

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
          isPublished: false,
          publishedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: {
            questions: 0,
          },
        },
        ...current,
      ]);

      formElement.reset();
      setShowCreateForm(false);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create assessment",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handlePublishAssessment(assessment: DeveloperAssessment) {
    const completedQuestions = assessment._count.questions;
    const requiredQuestions = assessment.questionCount || 25;

    if (assessment.isPublished || completedQuestions !== requiredQuestions) {
      return;
    }

    const confirmed = window.confirm(
      `Publish "${assessment.title}"? Once published, its questions can no longer be edited.`,
    );

    if (!confirmed) return;

    try {
      setPublishingAssessmentId(assessment.id);
      setPublishError("");

      const response = await publishAssessment(assessment.id);

      setAssessments((current) =>
        current.map((item) =>
          item.id === assessment.id
            ? {
                ...item,
                isPublished: response.data.isPublished,
                publishedAt: response.data.publishedAt,
                updatedAt: response.data.updatedAt,
              }
            : item,
        ),
      );
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish assessment",
      );
    } finally {
      setPublishingAssessmentId(null);
    }
  }

  return (
    <DeveloperShell
      eyebrow="Developer tools"
      title="Manage skill assessments"
      lead="Build and maintain assessment question banks."
    >
      <section className="role-panel assessment-management-page">
        <div className="assessment-management-heading">
          <div>
            <p className="eyebrow">Skill assessments</p>
            <h2>Assessment library</h2>
            <p>Create assessments and prepare their 25-question banks.</p>
          </div>

          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setCreateError("");
            }}
          >
            {showCreateForm ? "Close form" : "+ Create assessment"}
          </button>
        </div>

        {showCreateForm && (
          <form
            className="assessment-create-card"
            onSubmit={handleCreateAssessment}
          >
            <div className="assessment-create-heading">
              <div>
                <p className="eyebrow">New assessment</p>
                <h3>Create skill assessment</h3>
              </div>
            </div>

            <div className="assessment-create-fields">
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

              <label className="assessment-create-wide">
                Description
                <textarea
                  name="description"
                  placeholder="Describe what this assessment covers..."
                />
              </label>
            </div>

            {createError && <p className="profile-error">{createError}</p>}

            <div className="assessment-create-actions">
              <button
                className="button button-primary"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create assessment"}
              </button>

              <button
                className="button"
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading && (
          <p className="assessment-management-message">
            Loading assessments...
          </p>
        )}

        {error && (
          <p className="profile-error assessment-management-message">{error}</p>
        )}

        {publishError && (
          <p className="profile-error assessment-management-message">
            {publishError}
          </p>
        )}

        {!loading && !error && assessments.length === 0 && (
          <article className="assessment-empty-card">
            <p className="eyebrow">Nothing here yet</p>
            <h2>No assessments yet</h2>
            <p>Create your first skill assessment to get started.</p>
          </article>
        )}

        {!loading && !error && assessments.length > 0 && (
          <div className="assessment-library-grid">
            {assessments.map((assessment) => {
              const completedQuestions = assessment._count.questions;
              const requiredQuestions = assessment.questionCount || 25;
              const progress = Math.min(
                (completedQuestions / requiredQuestions) * 100,
                100,
              );
              const complete = completedQuestions === requiredQuestions;
              const readyToPublish = complete && !assessment.isPublished;

              return (
                <article
                  className="assessment-library-card"
                  key={assessment.id}
                >
                  <div className="assessment-library-card-top">
                    <p className="eyebrow">{assessment.skillName}</p>

                    <span
                      className={[
                        "assessment-library-status",
                        assessment.isPublished
                          ? "is-published"
                          : readyToPublish
                            ? "is-complete"
                            : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {assessment.isPublished
                        ? "Published"
                        : readyToPublish
                          ? "Ready to publish"
                          : "Draft"}
                    </span>
                  </div>

                  <h2>{assessment.title}</h2>

                  {assessment.description && (
                    <p className="assessment-library-description">
                      {assessment.description}
                    </p>
                  )}

                  <div className="assessment-library-progress-row">
                    <span>
                      {completedQuestions} of {requiredQuestions} questions
                    </span>

                    <strong>{Math.round(progress)}%</strong>
                  </div>

                  <div
                    className="assessment-library-progress"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={requiredQuestions}
                    aria-valuenow={completedQuestions}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>

                  <div className="assessment-library-meta">
                    <span>
                      Passing score
                      <strong>{assessment.passingScore}</strong>
                    </span>

                    <span>
                      Duration
                      <strong>{assessment.durationMinutes} min</strong>
                    </span>
                  </div>

                  <div className="assessment-library-actions">
                    <Link
                      className="assessment-library-link"
                      to={`/dashboard/developer/assessments/${assessment.id}`}
                    >
                      {assessment.isPublished
                        ? "View questions"
                        : "Open assessment builder"}
                      <span aria-hidden="true">→</span>
                    </Link>

                    {readyToPublish && (
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => handlePublishAssessment(assessment)}
                        disabled={publishingAssessmentId === assessment.id}
                      >
                        {publishingAssessmentId === assessment.id
                          ? "Publishing..."
                          : "Publish assessment"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DeveloperShell>
  );
}
