import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Close, Eye } from "./Icons";
import { login, loginWithGoogle, register } from "../../services/auth.service";
import { useAuth } from "../../stores/useAuth";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY_ADMIN">(
    "JOB_SEEKER",
  );
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [mode, setMode] = useState<"signIn" | "register">("signIn");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleButton = useRef<HTMLDivElement>(null);
  const registering = mode === "register";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!open || !googleClientId || (registering && role === "COMPANY_ADMIN")) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButton.current) return;
      googleButton.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => {
          setError("");
          setSubmitting(true);
          loginWithGoogle(credential)
            .then(finishAuthentication)
            .catch((requestError: unknown) =>
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Unable to sign in with Google.",
              ),
            )
            .finally(() => setSubmitting(false));
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 358,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existingScript) {
      if (window.google) renderGoogleButton();
      else existingScript.addEventListener("load", renderGoogleButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderGoogleButton, { once: true });
    document.head.appendChild(script);
  }, [open, googleClientId, registering, role]);

  if (!open) return null;

  function finishAuthentication(session: Awaited<ReturnType<typeof login>>) {
    useAuth.getState().login(session);
    const returnTo = sessionStorage.getItem("authReturnTo");
    const defaultDestination =
      session.user.role === "COMPANY_ADMIN" ? "/admin" : "/";
    sessionStorage.removeItem("authReturnTo");
    window.location.assign(returnTo ?? defaultDestination);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = registering
        ? await register({
            name,
            email,
            password,
            role,
            ...(role === "COMPANY_ADMIN" ? { companyName, phone, city } : {}),
          })
        : await login(email, password);
      finishAuthentication(session);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="auth-modal"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <form className="auth-dialog" onSubmit={handleSubmit}>
        <button
          className="auth-close"
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
        >
          <Close />
        </button>
        <h2>
          {registering ? "Create your Polaris account" : "Sign in to Polaris"}
        </h2>
        <p className="auth-copy">
          {registering
            ? "Start saving roles, tracking applications, and finding better matches."
            : "Track applications, save roles, and receive better matches."}
        </p>
        {(!registering || role === "JOB_SEEKER") && (
          <>
            {googleClientId ? (
              <div className="auth-google" ref={googleButton} />
            ) : (
              <button
                className="auth-google-unavailable"
                type="button"
                onClick={() => setError("Google Sign-In is not configured yet.")}
              >
                Continue with Google
              </button>
            )}
            <div className="auth-divider"><span>or use email</span></div>
          </>
        )}
        {registering && (
          <>
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Your name"
            />
            <label htmlFor="register-role">Register as</label>
            <select
              id="register-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "JOB_SEEKER" | "COMPANY_ADMIN")
              }
            >
              <option value="JOB_SEEKER">Job seeker</option>
              <option value="COMPANY_ADMIN">Company admin</option>
            </select>
            {role === "COMPANY_ADMIN" && (
              <>
                <label htmlFor="company-name">Company name</label>
                <input
                  id="company-name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                  placeholder="Your company"
                />
                <label htmlFor="company-phone">Phone</label>
                <input
                  id="company-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  placeholder="0812..."
                />
                <label htmlFor="company-city">City</label>
                <input
                  id="company-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  required
                  placeholder="Jakarta"
                />
              </>
            )}
          </>
        )}
        <label htmlFor="sign-in-email">Email</label>
        <input
          id="sign-in-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
        />
        <label htmlFor="sign-in-password">Password</label>
        <div className="password-input">
          <input
            id="sign-in-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Eye />
          </button>
        </div>
        {!registering && (
          <a className="auth-forgot" href="/reset-password">
            Forgot password?
          </a>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {registering && (
          <p className="auth-note">
            We send a verification link to your email. Verify it within one hour
            to apply or subscribe.
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting
            ? "Please wait…"
            : registering
              ? "Create account"
              : "Sign in"}
        </button>
        <p className="auth-switch">
          {registering ? "Already have an account?" : "New to Polaris?"}
          <button
            type="button"
            onClick={() => {
              setMode(registering ? "signIn" : "register");
              setError("");
            }}
          >
            {registering ? "Sign in" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}
