import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

import type {
  StartAssessmentData,
  AnswerOption,
  SubmitAssessmentData,
} from "../types/assessment";

import {
  submitAssessment,
  fetchAssessmentResultDetail,
  generateAssessmentCertificate,
  downloadAssessmentCertificate,
} from "../lib/assessment-api";

interface PersistedAssessmentProgress {
  assessmentData: StartAssessmentData;
  answers: Record<number, AnswerOption>;
  currentIndex: number;
}

const getAssessmentStorageKey = (assessmentId: string | undefined) =>
  `assessment-progress-${assessmentId}`;

export default function AssessmentTakePage() {
  const { assessmentId } = useParams();
  const location = useLocation();

  const navigationAssessmentData = location.state as StartAssessmentData | null;

  const storageKey = getAssessmentStorageKey(assessmentId);

  const persistedProgress = useMemo<PersistedAssessmentProgress | null>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      return JSON.parse(stored) as PersistedAssessmentProgress;
    } catch {
      sessionStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey]);

  const validPersistedProgress =
    persistedProgress &&
    String(persistedProgress.assessmentData.assessment.id) === assessmentId
      ? persistedProgress
      : null;

  const assessmentData =
    navigationAssessmentData ?? validPersistedProgress?.assessmentData ?? null;

  const [currentIndex, setCurrentIndex] = useState(
    validPersistedProgress?.currentIndex ?? 0,
  );

  const [answers, setAnswers] = useState<Record<number, AnswerOption>>(
    validPersistedProgress?.answers ?? {},
  );

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<SubmitAssessmentData | null>(null);

  useEffect(() => {
    if (!assessmentData || result) {
      return;
    }

    const progress: PersistedAssessmentProgress = {
      assessmentData,
      answers,
      currentIndex,
    };

    sessionStorage.setItem(storageKey, JSON.stringify(progress));
  }, [assessmentData, answers, currentIndex, result, storageKey]);

  const [checkingResult, setCheckingResult] = useState(true);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const [certificateError, setCertificateError] = useState("");

  useEffect(() => {
    if (!assessmentData) {
      setCheckingResult(false);
      return;
    }

    const checkExistingResult = async () => {
      try {
        const response = await fetchAssessmentResultDetail(
          assessmentData.resultId,
        );

        const detail = response.data;

        const correctAnswers = detail.answers.filter(
          (answer: { isCorrect: boolean }) => answer.isCorrect,
        ).length;

        if (!detail.completedAt) {
          return;
        }

        setResult({
          resultId: detail.resultId,
          score: detail.score,
          isPassed: detail.isPassed,
          badgeName: detail.badgeName,
          completedAt: detail.completedAt,
          correctAnswers,
          totalQuestions: detail.answers.length,
        });
      } catch {
        // 404 means the attempt is still unfinished.
        // That's fine, keep showing the assessment.
      } finally {
        setCheckingResult(false);
      }
    };

    checkExistingResult();
  }, [assessmentData]);

  useEffect(() => {
    if (!assessmentData) return;

    const updateTimer = () => {
      const expiresAt = new Date(assessmentData.expiresAt).getTime();

      const now = Date.now();

      const seconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setRemainingSeconds(seconds);
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [assessmentData]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);

    const seconds = remainingSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [remainingSeconds]);

  if (checkingResult) {
    return (
      <div className="workspace-dashboard assessment-take-page">
        <Navbar />
        <main>
          <section className="role-panel">
            <p>Checking assessment status...</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!assessmentData) {
    return <Navigate replace to={`/dashboard/assessments/${assessmentId}`} />;
  }

  const question = assessmentData.questions[currentIndex];

  const selectedAnswer = answers[question.id];

  const handleSelectAnswer = (answer: AnswerOption) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: answer,
    }));
  };

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goNext = () => {
    setCurrentIndex((index) =>
      Math.min(assessmentData.questions.length - 1, index + 1),
    );
  };

  const handleSubmit = async () => {
    if (!assessmentData) return;

    const unansweredQuestions = assessmentData.questions
      .map((question, index) => ({
        id: question.id,
        number: index + 1,
      }))
      .filter(({ id }) => !answers[id]);

    if (unansweredQuestions.length > 0) {
      setSubmitError(
        `Please answer question${
          unansweredQuestions.length > 1 ? "s" : ""
        } ${unansweredQuestions
          .map((question) => question.number)
          .join(", ")} before submitting.`,
      );

      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const submittedAnswers = assessmentData.questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id],
      }));

      const response = await submitAssessment(
        assessmentData.assessment.id,
        assessmentData.resultId,
        submittedAnswers,
      );
      sessionStorage.removeItem(storageKey);
      setResult(response.data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit assessment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!result || !result.isPassed) return;

    try {
      setDownloadingCertificate(true);
      setCertificateError("");

      await generateAssessmentCertificate(result.resultId);

      const blob = await downloadAssessmentCertificate(result.resultId);

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${result.resultId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setCertificateError(
        error instanceof Error
          ? error.message
          : "Failed to download certificate",
      );
    } finally {
      setDownloadingCertificate(false);
    }
  };

  if (result) {
    return (
      <div className="workspace-dashboard assessment-take-page">
        <Navbar />

        <main>
          <section className="role-panel">
            <article className="panel-card">
              <p className="eyebrow">Assessment complete</p>

              <h1>
                {result.isPassed ? "You passed!" : "Assessment not passed"}
              </h1>

              <div className="panel-stats">
                <article>
                  <span>Score</span>
                  <b>{result.score}</b>
                </article>

                <article>
                  <span>Correct answers</span>
                  <b>
                    {result.correctAnswers}/{result.totalQuestions}
                  </b>
                </article>

                <article>
                  <span>Result</span>
                  <b>{result.isPassed ? "PASS" : "FAIL"}</b>
                </article>
              </div>

              {result.badgeName && (
                <p>
                  Badge earned: <strong>{result.badgeName}</strong>
                </p>
              )}

              {result.isPassed && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCertificate}
                >
                  {downloadingCertificate
                    ? "Preparing certificate..."
                    : "Download certificate"}
                </button>
              )}

              {certificateError && <p>{certificateError}</p>}

              <Link
                className="button button-primary"
                to="/dashboard/assessments"
              >
                Back to assessments
              </Link>
            </article>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="workspace-dashboard assessment-take-page">
      <Navbar />

      <main>
        <section className="role-panel">
          <div>
            <p className="eyebrow">{assessmentData.assessment.skillName}</p>

            <h1>{assessmentData.assessment.title}</h1>

            <p>
              Question {currentIndex + 1} of {assessmentData.questions.length}
            </p>

            <strong>Time remaining: {formattedTime}</strong>
          </div>

          <article className="panel-card">
            <h2>{question.question}</h2>

            <div>
              {(
                Object.entries(question.options) as [AnswerOption, string][]
              ).map(([key, value]) => (
                <label
                  key={key}
                  style={{
                    display: "block",
                    marginBottom: "12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={key}
                    checked={selectedAnswer === key}
                    onChange={() => handleSelectAnswer(key)}
                  />

                  <span>
                    {" "}
                    {key}. {value}
                  </span>
                </label>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                className="button"
                onClick={goPrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>

              {currentIndex < assessmentData.questions.length - 1 ? (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={goNext}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit assessment"}
                </button>
              )}
              {submitError && <p>{submitError}</p>}
            </div>
          </article>

          <p>
            Answered: {Object.keys(answers).length} /{" "}
            {assessmentData.questions.length}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
