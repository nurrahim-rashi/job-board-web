import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  forgotPassword,
  resetPassword,
  validatePasswordResetLink,
  verifyEmail,
  resendVerification,
  resendVerificationByToken,
} from "../services/auth.service";
import { ApiRequestError } from "../lib/axios";
import { useAuth } from "../stores/useAuth";
import { PasswordField } from "../components/site/PasswordField";

type EmailAction = "verify" | "forgot" | "reset";
type LinkStatus = "ready" | "checking" | "success" | "expired" | "invalid" | "error";

function linkFailure(error: unknown, action: EmailAction): "invalid" | "expired" | null {
  if (!(error instanceof ApiRequestError)) return null;
  const prefix = action === "verify" ? "VERIFICATION" : "PASSWORD_RESET";
  if (error.code === `${prefix}_INVALID`) return "invalid";
  if (error.code === `${prefix}_EXPIRED`) return "expired";
  return null;
}

export default function EmailActionPage({ action }: { action: EmailAction }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  // A different link starts a new flow, including when navigating without a reload.
  return <EmailActionForm key={`${action}:${token}`} action={action} token={token} />;
}

function EmailActionForm({ action, token }: { action: EmailAction; token: string }) {
  const invalidToken = action !== "forgot" && token.length < 20;
  const [message, setMessage] = useState("");
  const [error, setError] = useState(invalidToken
    ? `${action === "verify" ? "Verification" : "Password reset"} link is invalid. Request a new link.`
    : "");
  const [status, setStatus] = useState<LinkStatus>(invalidToken ? "invalid" : action === "forgot" ? "ready" : "checking");
  const validationRequest = useRef<Promise<void> | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (action === "forgot" || invalidToken) return;
    let active = true;
    // Reuse the request during StrictMode effect replay: verification consumes the token.
    const request = validationRequest.current ??= action === "verify"
      ? verifyEmail(token) : validatePasswordResetLink(token);
    request.then(() => {
      if (!active) return;
      if (action === "verify") {
        useAuth.getState().logout();
        setStatus("success");
        setMessage("Email verified. Please sign in again to use protected features.");
      } else {
        setStatus("ready");
      }
    }).catch((requestError: unknown) => {
      if (!active) return;
      setStatus(linkFailure(requestError, action) ?? "error");
      setError(requestError instanceof Error ? requestError.message : "Unable to check your link. Please try again.");
    });
    return () => { active = false; };
  }, [action, invalidToken, token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || sent) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setSending(true);
    setError("");
    try {
      if (status === "expired") await resendVerificationByToken(token);
      else await resendVerification(email);
      setSent(true);
      setMessage("If your account needs verification, a new link has been sent. It is valid for 5 minutes. Check your inbox and spam folder.");
    } catch (requestError) {
      const failure = linkFailure(requestError, "verify");
      if (failure) setStatus(failure);
      setError(requestError instanceof Error ? requestError.message : "Unable to send a new link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setError("");
    setMessage("");
    setSending(true);
    const form = new FormData(event.currentTarget);
    try {
      if (action === "forgot") {
        await forgotPassword(String(form.get("email")));
        setMessage("If this account uses email and password, we sent a reset link. The link is valid for 60 minutes.");
      }
      if (action === "reset") {
        const password = String(form.get("password"));
        const confirmPassword = String(form.get("confirmPassword"));
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        await resetPassword(token, password);
        setStatus("success");
        setMessage("Password reset. You can now sign in.");
      }
    } catch (requestError) {
      const failure = linkFailure(requestError, action);
      if (failure) setStatus(failure);
      setError(requestError instanceof Error ? requestError.message : "Unable to complete this request.");
    } finally {
      setSending(false);
    }
  }

  const title = action === "verify"
    ? status === "expired" ? "Verification link expired"
      : status === "invalid" ? "Invalid verification link"
      : status === "success" ? "Email verified"
      : status === "error" ? "Unable to verify email"
      : "Verifying your email"
    : action === "forgot" ? "Reset your password"
      : status === "expired" ? "Password reset link expired"
      : status === "invalid" ? "Invalid password reset link"
      : status === "success" ? "Password reset successful"
      : status === "checking" ? "Checking your password reset link"
      : status === "error" ? "Unable to check password reset link"
      : "Choose a new password";

  return (
    <main className="email-action">
      <section>
        <p className="eyebrow">Polaris account</p>
        <h1>{title}</h1>
        {action === "verify" ? (
          <>
            <p role="status">{message || error || (status === "checking" ? "Checking your verification link…" : "")}</p>
            {(status === "expired" || status === "invalid") && (
              <form onSubmit={resend}>
                <p>Verification links are valid for 5 minutes.</p>
                {status === "invalid" && !sent && (
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
            {status === "error" && (
              <button className="profile-submit" onClick={() => window.location.reload()}>
                Try again
              </button>
            )}
            <a className="email-action-signin" href="/?auth=signin">Sign in to Polaris</a>
          </>
        ) : action === "reset" && status !== "ready" ? (
          <>
            {status === "checking" && <p role="status">Checking your password reset link…</p>}
            {error && <p className="profile-error" role="alert">{error}</p>}
            {message && <p className="profile-notice" role="status">{message}</p>}
            {(status === "invalid" || status === "expired") && (
              <a className="profile-submit" href="/reset-password">Request a new reset link</a>
            )}
            {status === "error" && (
              <button className="profile-submit" onClick={() => window.location.reload()}>Try again</button>
            )}
            <a className="email-action-signin" href="/?auth=signin">Back to sign in</a>
          </>
        ) : (
          <form onSubmit={submit}>
            {action === "forgot" ? (
              <label>
                Email
                <input type="email" name="email" required placeholder="you@example.com" />
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
                <p className="auth-note">Use uppercase, lowercase, a number, and a special character.</p>
              </>
            )}
            {message && <p className="profile-notice" role="status">{message}</p>}
            {error && <p className="profile-error" role="alert">{error}</p>}
            <button className="profile-submit" disabled={sending}>
              {sending ? "Please wait…" : action === "forgot" ? "Send reset link" : "Reset password"}
            </button>
            <a className="email-action-signin" href="/?auth=signin">Back to sign in</a>
          </form>
        )}
      </section>
    </main>
  );
}
