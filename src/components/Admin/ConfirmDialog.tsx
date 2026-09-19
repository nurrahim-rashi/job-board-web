import { Close } from "../site/Icons";
import { createPortal } from "react-dom";

type ConfirmDialogProps = { open: boolean; title: string; body: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void };

export function ConfirmDialog({ open, title, body, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;
  return createPortal(
    <div className="admin-dialog">
      <div>
        <button type="button" aria-label="Close" onClick={onCancel}>
          <Close />
        </button>
        <h2>{title}</h2>
        <p>{body}</p>
        <footer>
          <button type="button" className="admin-btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-btn danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
