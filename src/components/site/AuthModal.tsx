import { useState, type FormEvent, type MouseEvent } from "react";
import { Close, Eye } from "./Icons";
import { login, register, saveSession } from "../../lib/auth";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY_ADMIN">("JOB_SEEKER");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [mode, setMode] = useState<"signIn" | "register">("signIn");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === "register";

  if (!open) return null;

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
      saveSession(session);
      window.location.assign(sessionStorage.getItem("authReturnTo") ?? "/");
      sessionStorage.removeItem("authReturnTo");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
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
        {registering && <>
          <label htmlFor="register-name">Name</label>
          <input id="register-name" type="text" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Your name" />
          <label htmlFor="register-role">Register as</label>
          <select id="register-role" value={role} onChange={(event) => setRole(event.target.value as "JOB_SEEKER" | "COMPANY_ADMIN")}>
            <option value="JOB_SEEKER">Job seeker</option>
            <option value="COMPANY_ADMIN">Company admin</option>
          </select>
          {role === "COMPANY_ADMIN" && <>
            <label htmlFor="company-name">Company name</label>
            <input id="company-name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required placeholder="Your company" />
            <label htmlFor="company-phone">Phone</label>
            <input id="company-phone" value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="0812..." />
            <label htmlFor="company-city">City</label>
            <input id="company-city" value={city} onChange={(event) => setCity(event.target.value)} required placeholder="Jakarta" />
          </>}
        </>}
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
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>
            <Eye />
          </button>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {registering && <p className="auth-note">We send a verification link to your email. Verify it within one hour to apply or subscribe.</p>}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : registering ? "Create account" : "Sign in"}
        </button>
        <p className="auth-switch">
          {registering ? "Already have an account?" : "New to Polaris?"}
          <button
            type="button"
            onClick={() => { setMode(registering ? "signIn" : "register"); setError(""); }}
          >
            {registering ? "Sign in" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}
