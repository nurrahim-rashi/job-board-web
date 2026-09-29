import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  resendVerificationByToken,
} from "../services/auth.service";
import { ApiRequestError } from "../lib/axios";
import { useAuth } from "../stores/useAuth";
import { PasswordField } from "../components/site/PasswordField";

type EmailAction = "verify" | "forgot" | "reset";

export default function EmailActionPage({ action }: { action: EmailAction }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const verificationStarted = useRef("");
  const [verificationStatus, setVerificationStatus] = useState<"checking" | "success" | "expired" | "invalid" | "error">("checking");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    if (action !== "verify") return;
    if (token.length < 20) {
      setVerificationStatus("invalid");
      setError("Verification link is invalid or missing a token. Request a new link.");
      return;
    }
    if (verificationStarted.current === token) return;
    verificationStarted.current = token;
    setVerificationStatus("checking");
    setMessage("");
    setError("");
    setSent(false);
    verifyEmail(token)
      .then(() => {
        useAuth.getState().logout();
        setVerificationStatus("success");
        setMessage("Email verified. Please sign in again to use protected features.");
      })
      .catch((requestError) => {
        setVerificationStatus(
          requestError instanceof ApiRequestError && requestError.code === "VERIFICATION_EXPIRED"
            ? "expired"
            : requestError instanceof ApiRequestError && requestError.code === "VERIFICATION_INVALID"
              ? "invalid" : "error",
        );
        setError(requestError.message);
      });
  }, [action, token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || sent) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setSending(true);
    setError("");
    try {
      if (verificationStatus === "expired") await resendVerificationByToken(token);
      else await resendVerification(email);
      setSent(true);
      setMessage("If your account needs verification, a new link has been sent. It is valid for 5 minutes. Check your inbox and spam folder.");
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.code === "VERIFICATION_INVALID")
        setVerificationStatus("invalid");
      setError(requestError instanceof Error ? requestError.message : "Unable to send a new link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      if (action === "forgot") {
        await forgotPassword(String(form.get("email")));
        setMessage(
          "If this account uses email and password, we sent a reset link.",
        );
      }
      if (action === "reset") {
        const password = String(form.get("password"));
        const confirmPassword = String(form.get("confirmPassword"));
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await resetPassword(token, password);
        setMessage("Password reset. You can now sign in.");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete this request.",
      );
    }
  }

  const title =
    action === "verify"
      ? verificationStatus === "expired" ? "Verification link expired"
        : verificationStatus === "invalid" ? "Invalid verification link"
        : verificationStatus === "success" ? "Email verified"
        : verificationStatus === "error" ? "Unable to verify email"
        : "Verifying your email"
      : action === "forgot"
        ? "Reset your password"
        : "Choose a new password";
  return (
    <main className="email-action">
      <section>
        <p className="eyebrow">Polaris account</p>
        <h1>{title}</h1>
        {action === "verify" ? (
          <>
            <p>{message || error || "Checking your verification link…"}</p>
            {(verificationStatus === "expired" || verificationStatus === "invalid") && (
              <form onSubmit={resend}>
                <p>Verification links are valid for 5 minutes.</p>
                {verificationStatus === "invalid" && !sent && (
                  <label>
                    Email
                    <input type="email" name="email" required placeholder="you@example.com" />
                  </label>
                )}
                <button className="profile-submit" disabled={sending || sent}>
                  {sending ? "Sending…" : sent ? "Verification email sent" : "Resend verification email"}
                </button>
              </form>
            )}
            {verificationStatus === "error" && (
              <button className="profile-submit" onClick={() => window.location.reload()}>
                Try again
              </button>
            )}
            <a className="email-action-signin" href="/?auth=signin">
              Sign in to Polaris
            </a>
          </>
        ) : (
          <form onSubmit={submit}>
            {action === "forgot" ? (
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
            ) : (
              <>
                <label>
                  New password
                  <PasswordField name="password" minLength={6} required />
                </label>
                <label>
                  Confirm new password
                  <PasswordField name="confirmPassword" minLength={6} required />
                </label>
                <p className="auth-note">
                  Use uppercase, lowercase, a number, and a special character.
                </p>
              </>
            )}
            {message && <p className="profile-notice">{message}</p>}
            {error && <p className="profile-error">{error}</p>}
            <button className="profile-submit">
              {action === "forgot" ? "Send reset link" : "Reset password"}
            </button>
            <a className="email-action-signin" href="/?auth=signin">
              Back to sign in
            </a>
          </form>
        )}
      </section>
    </main>
  );
}
