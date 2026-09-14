import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyAssessmentCertificate } from "../lib/assessment-api";
import type { CertificateVerificationData } from "../types/assessment";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function CertificateVerificationPage() {
  const { certificateCode } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState(certificateCode ?? "");
  const [certificate, setCertificate] =
    useState<CertificateVerificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyCertificate = async (value: string) => {
    const trimmedCode = value.trim();

    if (!trimmedCode) {
      setError("Please enter a certificate code.");
      setCertificate(null);
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);

    try {
      const response = await verifyAssessmentCertificate(trimmedCode);
      setCertificate(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Certificate could not be verified.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Please enter a certificate code.");
      return;
    }

    navigate(`/verify-certificate/${encodeURIComponent(trimmedCode)}`);
  };

  useEffect(() => {
    if (!certificateCode) {
      setCertificate(null);
      setError("");
      return;
    }

    setCode(certificateCode);
    void verifyCertificate(certificateCode);
  }, [certificateCode]);

  return (
    <div className="polaris-page">
      <Navbar />

      <main className="certificate-verification-page">
        <section className="certificate-verification-hero">
          <div className="content narrow">
            <p className="eyebrow">Polaris Certificate Verification</p>

            <h1>Verify a certificate</h1>

            <p className="certificate-verification-intro">
              Enter a Polaris certificate ID to confirm that a skill assessment
              certificate is authentic.
            </p>
          </div>
        </section>

        <section className="certificate-verification-content">
          <div className="content narrow">
            <form
              className="certificate-verification-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="certificate-code">Certificate code</label>

              <div className="certificate-verification-input-row">
                <input
                  id="certificate-code"
                  type="text"
                  placeholder="CERT-..."
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />

                <button
                  className="button button-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify certificate"}
                </button>
              </div>
            </form>

            {error ? (
              <section className="certificate-verification-result certificate-verification-error">
                <p className="eyebrow">Verification result</p>
                <h2>Certificate not verified</h2>
                <p>{error}</p>
              </section>
            ) : null}

            {certificate ? (
              <section className="certificate-verification-result certificate-verification-success">
                <div className="certificate-verification-status">
                  <span aria-hidden="true">✓</span>

                  <div>
                    <p className="eyebrow">Verification result</p>
                    <h2>Valid Certificate</h2>
                    <p>
                      This certificate is registered in the Polaris assessment
                      system.
                    </p>
                  </div>
                </div>

                <dl className="certificate-verification-details">
                  <div>
                    <dt>Recipient</dt>
                    <dd>{certificate.recipientName}</dd>
                  </div>

                  <div>
                    <dt>Assessment</dt>
                    <dd>{certificate.assessmentTitle}</dd>
                  </div>

                  <div>
                    <dt>Skill</dt>
                    <dd>{certificate.skillName}</dd>
                  </div>

                  <div>
                    <dt>Score</dt>
                    <dd>{certificate.score}</dd>
                  </div>

                  <div>
                    <dt>Issued</dt>
                    <dd>
                      {new Date(certificate.issuedAt).toLocaleDateString(
                        "en-GB",
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Certificate ID</dt>
                    <dd>{certificate.certificateCode}</dd>
                  </div>
                </dl>
              </section>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
