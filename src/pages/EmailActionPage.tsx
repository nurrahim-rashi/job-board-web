import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../services/auth.service";
import { useAuth } from "../stores/useAuth";
import { PasswordField } from "../components/site/PasswordField";

type EmailAction = "verify" | "forgot" | "reset";

export default function EmailActionPage({ action }: { action: EmailAction }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const verificationStarted = useRef(false);
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    if (action !== "verify" || !token || verificationStarted.current) return;
    verificationStarted.current = true;

    verifyEmail(token)
      .then(async () => {
        useAuth.getState().logout();
        setMessage(
          "Email verified. Please sign in again to use protected features.",
        );
      })
      .catch((requestError) => setError(requestError.message));
  }, [action, token]);

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
      ? "Verifying your email"
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
            <a className="profile-submit" href="/?auth=signin">
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
