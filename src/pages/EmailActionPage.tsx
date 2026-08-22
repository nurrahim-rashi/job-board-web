import { useEffect, useState, type FormEvent } from "react";
import { forgotPassword, resetPassword, verifyEmail } from "../lib/auth";

type EmailAction = "verify" | "forgot" | "reset";

export default function EmailActionPage({ action }: { action: EmailAction }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  useEffect(() => {
    if (action !== "verify" || !token) return;
    verifyEmail(token)
      .then(() =>
        setMessage(
          "Email verified. You can now sign in and use protected features.",
        ),
      )
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
        await resetPassword(token, String(form.get("password")));
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
            <a className="profile-submit" href="/">
              Back to Polaris
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
              <label>
                New password
                <input type="password" name="password" minLength={8} required />
              </label>
            )}
            {message && <p className="profile-notice">{message}</p>}
            {error && <p className="profile-error">{error}</p>}
            <button className="profile-submit">
              {action === "forgot" ? "Send reset link" : "Reset password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
