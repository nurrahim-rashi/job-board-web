import { useState, type FormEvent } from "react";
import { Close } from "./Icons";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("accessToken", "demo-session");
    window.location.assign("/");
  }

  return (
    <div className="auth-modal" role="presentation" onMouseDown={onClose}>
      <form
        className="auth-dialog"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="auth-close"
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
        >
          <Close />
        </button>
        <h2>Sign in to Polaris</h2>
        <p className="auth-copy">
          Track applications, save roles, and receive better matches.
        </p>
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
        <input
          id="sign-in-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="••••••••"
        />
        <button className="auth-submit" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
