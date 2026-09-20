import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "./Icons";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Every password box in Polaris gets the same show/hide control, so the field
 * is a component rather than markup repeated per form.
 */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Hide password" : "Show password";

  return (
    <div className="password-input">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setVisible((shown) => !shown)}
        aria-label={label}
        title={label}
        // Revealing a password sends no request; never show a spinner here.
        data-no-request-loading
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}
