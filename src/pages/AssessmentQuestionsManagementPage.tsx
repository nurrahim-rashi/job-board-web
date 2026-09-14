import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { DeveloperShell } from "../components/Developer/DeveloperShell";

import {
  fetchAssessmentQuestions,
  createAssessmentQuestion,
  deleteAssessmentQuestion,
  updateAssessmentQuestion,
} from "../lib/assessment-api";

import type { DeveloperAssessmentQuestion } from "../types/assessment";

export default function AssessmentQuestionsManagementPage() {
  const { assessmentId } = useParams();

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [questions, setQuestions] = useState<DeveloperAssessmentQuestion[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
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

        const response = await fetchAssessmentQuestions(Number(assessmentId));

        setQuestions(response.data);
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

  async function handleCreateQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assessmentId) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    setCreating(true);
    setCreateError("");

    try {
      const response = await createAssessmentQuestion(Number(assessmentId), {
        question: String(form.get("question") ?? "").trim(),
        options: {
          A: String(form.get("optionA") ?? "").trim(),
          B: String(form.get("optionB") ?? "").trim(),
          C: String(form.get("optionC") ?? "").trim(),
          D: String(form.get("optionD") ?? "").trim(),
        },
        correctAnswer: String(form.get("correctAnswer") ?? "") as
          | "A"
          | "B"
          | "C"
          | "D",
        questionOrder: Number(form.get("questionOrder")),
      });

      setQuestions((current) =>
        [...current, response.data].sort(
          (a, b) => a.questionOrder - b.questionOrder,
        ),
      );

      formElement.reset();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create question",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateQuestion(
    event: FormEvent<HTMLFormElement>,
    questionId: number,
  ) {
    event.preventDefault();

    if (!assessmentId) return;

    const form = new FormData(event.currentTarget);

    setEditing(true);
    setEditError("");

    try {
      const response = await updateAssessmentQuestion(
        Number(assessmentId),
        questionId,
        {
          question: String(form.get("question") ?? "").trim(),
          options: {
            A: String(form.get("optionA") ?? "").trim(),
            B: String(form.get("optionB") ?? "").trim(),
            C: String(form.get("optionC") ?? "").trim(),
            D: String(form.get("optionD") ?? "").trim(),
          },
          correctAnswer: String(form.get("correctAnswer") ?? "") as
            | "A"
            | "B"
            | "C"
            | "D",
          questionOrder: Number(form.get("questionOrder")),
        },
      );

      setQuestions((current) =>
        current
          .map((question) =>
            question.id === questionId ? response.data : question,
          )
          .sort((a, b) => a.questionOrder - b.questionOrder),
      );

      setEditingQuestionId(null);
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update question",
      );
    } finally {
      setEditing(false);
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!assessmentId) return;

    const confirmed = window.confirm("Delete this assessment question?");

    if (!confirmed) return;

    try {
      setDeletingQuestionId(questionId);

      await deleteAssessmentQuestion(Number(assessmentId), questionId);

      setQuestions((current) =>
        current.filter((question) => question.id !== questionId),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete question",
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  const nextAvailableQuestionOrder =
    Array.from({ length: 25 }, (_, index) => index + 1).find(
      (order) =>
        !questions.some((question) => question.questionOrder === order),
    ) ?? 25;

  return (
    <DeveloperShell
      eyebrow="Developer tools"
      title="Manage questions"
      lead={`Questions: ${questions.length}/25`}
    >
      <section className="role-panel">
        <Link to="/dashboard/developer/assessments">← Back to assessments</Link>

        {loading && <p>Loading questions...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && questions.length < 25 && (
          <form className="profile-card" onSubmit={handleCreateQuestion}>
            <p className="eyebrow">New question</p>
            <h2>Add assessment question</h2>

            <div className="profile-fields">
              <label className="profile-wide">
                Question
                <textarea
                  name="question"
                  placeholder="Enter the question..."
                  required
                />
              </label>

              <label>
                Option A
                <input name="optionA" required />
              </label>

              <label>
                Option B
                <input name="optionB" required />
              </label>

              <label>
                Option C
                <input name="optionC" required />
              </label>

              <label>
                Option D
                <input name="optionD" required />
              </label>

              <label>
                Correct answer
                <select name="correctAnswer" defaultValue="A" required>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>

              <label>
                Question order
                <input
                  name="questionOrder"
                  type="number"
                  min={1}
                  max={25}
                  defaultValue={nextAvailableQuestionOrder}
                  required
                />
              </label>
            </div>

            {createError && <p className="profile-error">{createError}</p>}

            <button
              type="submit"
              className="profile-submit"
              disabled={creating}
            >
              {creating ? "Adding..." : "Add question"}
            </button>
          </form>
        )}

        {!loading && !error && questions.length === 0 && (
          <article className="panel-card">
            <h2>No questions yet</h2>
            <p>Add the first question to this assessment.</p>
          </article>
        )}

        {!loading && !error && questions.length > 0 && (
          <div>
            {questions.map((question) => (
              <article className="panel-card" key={question.id}>
                <p className="eyebrow">Question {question.questionOrder}</p>

                <h2>{question.question}</h2>

                <p>A. {question.options.A}</p>
                <p>B. {question.options.B}</p>
                <p>C. {question.options.C}</p>
                <p>D. {question.options.D}</p>

                <p>
                  Correct answer: <strong>{question.correctAnswer}</strong>
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setEditingQuestionId(question.id)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="button"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={deletingQuestionId === question.id}
                  >
                    {deletingQuestionId === question.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                {editingQuestionId === question.id && (
                  <form
                    onSubmit={(event) =>
                      handleUpdateQuestion(event, question.id)
                    }
                  >
                    <div className="profile-fields">
                      <label className="profile-wide">
                        Question
                        <textarea
                          name="question"
                          defaultValue={question.question}
                          required
                        />
                      </label>

                      <label>
                        Option A
                        <input
                          name="optionA"
                          defaultValue={question.options.A}
                          required
                        />
                      </label>

                      <label>
                        Option B
                        <input
                          name="optionB"
                          defaultValue={question.options.B}
                          required
                        />
                      </label>

                      <label>
                        Option C
                        <input
                          name="optionC"
                          defaultValue={question.options.C}
                          required
                        />
                      </label>

                      <label>
                        Option D
                        <input
                          name="optionD"
                          defaultValue={question.options.D}
                          required
                        />
                      </label>

                      <label>
                        Correct answer
                        <select
                          name="correctAnswer"
                          defaultValue={question.correctAnswer}
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </label>

                      <label>
                        Question order
                        <input
                          name="questionOrder"
                          type="number"
                          min={1}
                          max={25}
                          defaultValue={question.questionOrder}
                          required
                        />
                      </label>
                    </div>

                    {editError && <p className="profile-error">{editError}</p>}

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "16px",
                      }}
                    >
                      <button
                        type="submit"
                        className="button button-primary"
                        disabled={editing}
                      >
                        {editing ? "Saving..." : "Save changes"}
                      </button>

                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </DeveloperShell>
  );
}
