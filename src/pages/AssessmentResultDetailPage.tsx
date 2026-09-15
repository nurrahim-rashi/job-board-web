import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clipboard, Share } from "../components/site/Icons";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { SeekerDashboardHero } from "../components/Dashboard/SeekerDashboardHero";
import { SeekerDashboardShell } from "../components/Dashboard/SeekerDashboardShell";
import {
  downloadAssessmentCertificate,
  fetchAssessmentResultDetail,
  generateAssessmentCertificate,
} from "../lib/assessment-api";

import type {
  AssessmentResultDetail,
  AssessmentCertificateData,
} from "../types/assessment";

export default function AssessmentResultDetailPage() {
  const { resultId } = useParams();

  const [result, setResult] = useState<AssessmentResultDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [downloading, setDownloading] = useState(false);

  const [certificateError, setCertificateError] = useState("");
  const [certificate, setCertificate] =
    useState<AssessmentCertificateData | null>(null);

  const [preparingShare, setPreparingShare] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

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

  const ensureCertificate = async () => {
    if (!result || !result.isPassed) {
      throw new Error("Certificate is only available for passed assessments");
    }

    if (certificate) {
      return certificate;
    }

    const response = await generateAssessmentCertificate(result.resultId);

    setCertificate(response.data);

    return response.data;
  };

  const handleDownloadCertificate = async () => {
    if (!result || !result.isPassed) return;

    try {
      setDownloading(true);
      setCertificateError("");

      await ensureCertificate();

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

  const getVerificationUrl = (certificateCode: string) =>
    `${window.location.origin}/verify-certificate/${encodeURIComponent(
      certificateCode,
    )}`;

  const handleCopyCertificateLink = async () => {
    try {
      setPreparingShare(true);
      setCertificateError("");
      setShareMessage("");

      const certificateData = await ensureCertificate();
      const verificationUrl = getVerificationUrl(
        certificateData.certificateCode,
      );

      await navigator.clipboard.writeText(verificationUrl);

      setShareMessage("Verification link copied.");
    } catch (error) {
      setCertificateError(
        error instanceof Error
          ? error.message
          : "Failed to copy certificate link",
      );
    } finally {
      setPreparingShare(false);
    }
  };

  const handleLinkedInShare = async () => {
    try {
      setPreparingShare(true);
      setCertificateError("");
      setShareMessage("");

      const certificateData = await ensureCertificate();
      const verificationUrl = getVerificationUrl(
        certificateData.certificateCode,
      );

      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        verificationUrl,
      )}`;

      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setCertificateError(
        error instanceof Error ? error.message : "Failed to share certificate",
      );
    } finally {
      setPreparingShare(false);
    }
  };

  const handleXShare = async () => {
    try {
      setPreparingShare(true);
      setCertificateError("");
      setShareMessage("");

      const certificateData = await ensureCertificate();
      const verificationUrl = getVerificationUrl(
        certificateData.certificateCode,
      );

      const text = `I earned the ${certificateData.assessment.title} certificate on Polaris.`;

      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(verificationUrl)}`;

      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setCertificateError(
        error instanceof Error ? error.message : "Failed to share certificate",
      );
    } finally {
      setPreparingShare(false);
    }
  };

  return (
    <div className="workspace-dashboard seeker-dashboard-overview">
      <Navbar />

      <main>
        <SeekerDashboardHero />

        <SeekerDashboardShell>
          <section className="role-panel">
            <Link to="/dashboard/assessments/results">
              ← Back to assessment history
            </Link>

            {loading ? (
              <p>Loading assessment result...</p>
            ) : error ? (
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
                    <div className="certificate-actions">
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={handleDownloadCertificate}
                        disabled={downloading || preparingShare}
                      >
                        {downloading
                          ? "Preparing certificate..."
                          : "Download certificate"}
                      </button>

                      <div className="certificate-share">
                        <div className="certificate-share-heading">
                          <Share />
                          <span>
                            <b>Share your certificate</b>
                            <small>
                              Share a public verification link to your
                              achievement.
                            </small>
                          </span>
                        </div>

                        <div className="certificate-share-buttons">
                          <button
                            type="button"
                            onClick={handleCopyCertificateLink}
                            disabled={preparingShare || downloading}
                          >
                            <Clipboard />
                            Copy link
                          </button>

                          <button
                            type="button"
                            onClick={handleLinkedInShare}
                            disabled={preparingShare || downloading}
                          >
                            LinkedIn
                          </button>

                          <button
                            type="button"
                            onClick={handleXShare}
                            disabled={preparingShare || downloading}
                          >
                            X
                          </button>
                        </div>

                        {shareMessage && (
                          <p className="certificate-share-message">
                            {shareMessage}
                          </p>
                        )}
                      </div>
                    </div>
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
        </SeekerDashboardShell>
      </main>

      <Footer />
    </div>
  );
}
