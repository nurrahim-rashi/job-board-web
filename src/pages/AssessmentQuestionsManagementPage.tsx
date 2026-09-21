import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { DeveloperShell } from "../components/Developer/DeveloperShell";
import {
  createAssessmentQuestion,
  deleteAssessmentQuestion,
  fetchAssessmentQuestions,
  updateAssessmentQuestion,
  publishAssessment,
  fetchDeveloperAssessments,
} from "../lib/assessment-api";
import type {
  AnswerOption,
  DeveloperAssessmentQuestion,
  DeveloperAssessment,
} from "../types/assessment";

const QUESTION_COUNT = 25;

export default function AssessmentQuestionsManagementPage() {
  const { assessmentId } = useParams();

  const [questions, setQuestions] = useState<DeveloperAssessmentQuestion[]>([]);
  const [selectedOrder, setSelectedOrder] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [assessment, setAssessment] = useState<DeveloperAssessment | null>(
    null,
  );
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const loadQuestions = async () => {
      if (!assessmentId) {
        setError("Assessment ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const numericAssessmentId = Number(assessmentId);

        const [questionsResponse, assessmentsResponse] = await Promise.all([
          fetchAssessmentQuestions(numericAssessmentId),
          fetchDeveloperAssessments(),
        ]);

        const currentAssessment =
          assessmentsResponse.data.find(
            (item) => item.id === numericAssessmentId,
          ) ?? null;

        if (!currentAssessment) {
          throw new Error("Assessment not found");
        }

        setAssessment(currentAssessment);

        const response = questionsResponse;
        const sortedQuestions = [...response.data].sort(
          (a, b) => a.questionOrder - b.questionOrder,
        );

        setQuestions(sortedQuestions);

        const firstEmptyOrder = Array.from(
          { length: QUESTION_COUNT },
          (_, index) => index + 1,
        ).find(
          (order) =>
            !sortedQuestions.some(
              (question) => question.questionOrder === order,
            ),
        );

        setSelectedOrder(
          sortedQuestions.length > 0
            ? sortedQuestions[0].questionOrder
            : (firstEmptyOrder ?? 1),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load assessment questions",
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [assessmentId]);

  const selectedQuestion =
    questions.find((question) => question.questionOrder === selectedOrder) ??
    null;

  const progress = Math.min((questions.length / QUESTION_COUNT) * 100, 100);

  function selectQuestion(order: number) {
    setSelectedOrder(order);
    setFormError("");
  }

  async function handleSubmitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assessmentId || assessment?.isPublished) return;

    const form = new FormData(event.currentTarget);

    const payload = {
      question: String(form.get("question") ?? "").trim(),
      options: {
        A: String(form.get("optionA") ?? "").trim(),
        B: String(form.get("optionB") ?? "").trim(),
        C: String(form.get("optionC") ?? "").trim(),
        D: String(form.get("optionD") ?? "").trim(),
      },
      correctAnswer: String(form.get("correctAnswer") ?? "A") as AnswerOption,
      questionOrder: selectedOrder,
    };

    setSaving(true);
    setFormError("");

    try {
      if (selectedQuestion) {
        const response = await updateAssessmentQuestion(
          Number(assessmentId),
          selectedQuestion.id,
          payload,
        );

        setQuestions((current) =>
          current
            .map((question) =>
              question.id === selectedQuestion.id ? response.data : question,
            )
            .sort((a, b) => a.questionOrder - b.questionOrder),
        );
      } else {
        const response = await createAssessmentQuestion(
          Number(assessmentId),
          payload,
        );

        setQuestions((current) =>
          [...current, response.data].sort(
            (a, b) => a.questionOrder - b.questionOrder,
          ),
        );

        const nextEmptyOrder = Array.from(
          { length: QUESTION_COUNT },
          (_, index) => index + 1,
        ).find(
          (order) =>
            order > selectedOrder &&
            ![...questions, response.data].some(
              (question) => question.questionOrder === order,
            ),
        );

        if (nextEmptyOrder) {
          setSelectedOrder(nextEmptyOrder);
        }
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save question",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishAssessment() {
    if (!assessmentId || !assessment) return;

    if (assessment.isPublished || questions.length !== QUESTION_COUNT) {
      return;
    }

    const confirmed = window.confirm(
      `Publish "${assessment.title}"? Once published, its questions can no longer be edited.`,
    );

    if (!confirmed) return;

    try {
      setPublishing(true);
      setPublishError("");

      const response = await publishAssessment(Number(assessmentId));

      setAssessment((current) =>
        current
          ? {
              ...current,
              isPublished: response.data.isPublished,
              publishedAt: response.data.publishedAt,
              updatedAt: response.data.updatedAt,
            }
          : current,
      );
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Failed to publish assessment",
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!assessmentId || assessment?.isPublished) return;

    const confirmed = window.confirm("Delete this assessment question?");
    if (!confirmed) return;

    try {
      setDeletingQuestionId(questionId);
      setFormError("");

      await deleteAssessmentQuestion(Number(assessmentId), questionId);

      setQuestions((current) =>
        current.filter((question) => question.id !== questionId),
      );
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to delete question",
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  return (
    <DeveloperShell
      eyebrow="Developer tools"
      title="Manage questions"
      lead={`${questions.length} of ${QUESTION_COUNT} questions ready`}
    >
      <section className="role-panel assessment-builder-page">
        <div className="assessment-builder-toolbar">
          <Link to="/dashboard/developer/assessments">
            ← Back to assessments
          </Link>

          <span>
            {questions.length}/{QUESTION_COUNT} questions
          </span>
        </div>

        {loading && <p>Loading questions...</p>}
        {error && <p className="profile-error">{error}</p>}

        {!loading && !error && (
          <div className="assessment-builder-layout">
            <aside className="assessment-progress-card">
              <p className="eyebrow">Progress</p>

              <strong className="assessment-progress-count">
                {questions.length}/{QUESTION_COUNT}
              </strong>

              <div
                className="assessment-progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={QUESTION_COUNT}
                aria-valuenow={questions.length}
              >
                <span style={{ width: `${progress}%` }} />
              </div>

              <div className="assessment-publish-panel">
                <span
                  className={[
                    "assessment-library-status",
                    assessment?.isPublished
                      ? "is-published"
                      : questions.length === QUESTION_COUNT
                        ? "is-complete"
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {assessment?.isPublished
                    ? "Published"
                    : questions.length === QUESTION_COUNT
                      ? "Ready to publish"
                      : "Draft"}
                </span>

                {!assessment?.isPublished &&
                  questions.length === QUESTION_COUNT && (
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handlePublishAssessment}
                      disabled={publishing}
                    >
                      {publishing ? "Publishing..." : "Publish assessment"}
                    </button>
                  )}

                {publishError && (
                  <p className="profile-error">{publishError}</p>
                )}
              </div>

              <div className="assessment-question-grid">
                {Array.from(
                  { length: QUESTION_COUNT },
                  (_, index) => index + 1,
                ).map((order) => {
                  const completed = questions.some(
                    (question) => question.questionOrder === order,
                  );

                  return (
                    <button
                      key={order}
                      type="button"
                      className={[
                        "assessment-question-slot",
                        selectedOrder === order ? "is-selected" : "",
                        completed ? "is-complete" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectQuestion(order)}
                      aria-label={`Question ${order}${
                        completed ? ", completed" : ", empty"
                      }`}
                    >
                      {order}
                    </button>
                  );
                })}
              </div>

              <p className="assessment-progress-note">
                {assessment?.isPublished
                  ? "This assessment is published. Questions are now read only."
                  : "Filled slots are saved questions. Select any slot to edit or create it."}
              </p>
            </aside>

            <div className="assessment-question-editor">
              <div className="assessment-editor-heading">
                <div>
                  <p className="eyebrow">Question {selectedOrder}</p>
                  <h2>{selectedQuestion ? "Edit question" : "Add question"}</h2>
                </div>

                <span
                  className={`assessment-question-state ${
                    selectedQuestion ? "is-saved" : ""
                  }`}
                >
                  {selectedQuestion ? "Saved" : "Empty"}
                </span>
              </div>

              <form
                key={selectedQuestion?.id ?? `new-${selectedOrder}`}
                onSubmit={handleSubmitQuestion}
              >
                <div className="assessment-editor-fields">
                  <label className="assessment-editor-wide">
                    Question
                    <textarea
                      name="question"
                      defaultValue={selectedQuestion?.question ?? ""}
                      placeholder="Enter the question..."
                      required
                      disabled={assessment?.isPublished}
                    />
                  </label>

                  {(["A", "B", "C", "D"] as const).map((option) => (
                    <label key={option}>
                      Option {option}
                      <input
                        name={`option${option}`}
                        defaultValue={selectedQuestion?.options[option] ?? ""}
                        required
                        disabled={assessment?.isPublished}
                      />
                    </label>
                  ))}

                  <label>
                    Correct answer
                    <select
                      name="correctAnswer"
                      defaultValue={selectedQuestion?.correctAnswer ?? "A"}
                      required
                      disabled={assessment?.isPublished}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </label>

                  <div className="assessment-order-display">
                    <span>Question order</span>
                    <strong>
                      {selectedOrder} of {QUESTION_COUNT}
                    </strong>
                  </div>
                </div>

                {formError && (
                  <p className="profile-error assessment-form-error">
                    {formError}
                  </p>
                )}

                <div className="assessment-editor-actions">
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={saving || assessment?.isPublished}
                  >
                    {assessment?.isPublished
                      ? "Published — read only"
                      : saving
                        ? "Saving..."
                        : selectedQuestion
                          ? "Save changes"
                          : "Add question"}
                  </button>

                  {selectedQuestion && (
                    <button
                      type="button"
                      className="button"
                      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                      disabled={
                        assessment?.isPublished ||
                        deletingQuestionId === selectedQuestion.id
                      }
                    >
                      {deletingQuestionId === selectedQuestion.id
                        ? "Deleting..."
                        : "Delete question"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </DeveloperShell>
  );
}
