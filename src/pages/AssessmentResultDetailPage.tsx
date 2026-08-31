import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import {
  downloadAssessmentCertificate,
  fetchAssessmentResultDetail,
  generateAssessmentCertificate,
} from "../lib/assessment-api";

import type { AssessmentResultDetail } from "../types/assessment";

export default function AssessmentResultDetailPage() {
  const { resultId } = useParams();

  const [result, setResult] = useState<AssessmentResultDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [downloading, setDownloading] = useState(false);

  const [certificateError, setCertificateError] = useState("");

  useEffect(() => {
    const loadResult = async () => {
      try {
        if (!resultId) {
          throw new Error("Result ID is missing");
        }

        const response = await fetchAssessmentResultDetail(Number(resultId));

        setResult(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load assessment result",
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId]);

  const handleDownloadCertificate = async () => {
    if (!result || !result.isPassed) return;

    try {
      setDownloading(true);
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
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-dashboard">
        <Navbar />
        <main>
          <section className="role-panel">
            <p>Loading assessment result...</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="workspace-dashboard">
      <Navbar />

      <main>
        <section className="role-panel">
          <Link to="/dashboard/assessments/results">
            ← Back to assessment history
          </Link>

          {error ? (
            <article className="panel-card">
              <h2>Unable to load result</h2>
              <p>{error}</p>
            </article>
          ) : result ? (
            <>
              <article className="panel-card">
                <p className="eyebrow">{result.skillName}</p>

                <h1>{result.title}</h1>

                <div className="panel-stats">
                  <article>
                    <span>Score</span>
                    <b>{result.score}</b>
                  </article>

                  <article>
                    <span>Result</span>
                    <b>{result.isPassed ? "PASS" : "FAIL"}</b>
                  </article>

                  <article>
                    <span>Completed</span>
                    <b>
                      {result.completedAt
                        ? new Date(result.completedAt).toLocaleDateString()
                        : "-"}
                    </b>
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
                    disabled={downloading}
                  >
                    {downloading
                      ? "Preparing certificate..."
                      : "Download certificate"}
                  </button>
                )}

                {certificateError && <p>{certificateError}</p>}
              </article>

              <article className="panel-card">
                <p className="eyebrow">Answer review</p>

                <h2>Your answers</h2>

                <ul className="workspace-list">
                  {result.answers.map((answer, index) => (
                    <li key={answer.questionId}>
                      <span>
                        <b>
                          {index + 1}. {answer.question}
                        </b>

                        <small>Your answer: {answer.answer}</small>
                      </span>

                      <em className={answer.isCorrect ? "good" : "wait"}>
                        {answer.isCorrect ? "Correct" : "Incorrect"}
                      </em>
                    </li>
                  ))}
                </ul>
              </article>
            </>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
