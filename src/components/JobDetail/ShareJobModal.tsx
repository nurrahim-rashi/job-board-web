import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Close, Share } from "../site/Icons";

type ShareJobModalProps = {
  open: boolean;
  title: string;
  company: string;
  url: string;
  onClose: () => void;
};

export function ShareJobModal({
  open,
  title,
  company,
  url,
  onClose,
}: ShareJobModalProps) {
  const [message, setMessage] = useState(
    `Check out ${title} at ${company} on Polaris.`,
  );
  const [copiedPlatform, setCopiedPlatform] = useState("");

  useEffect(() => {
    if (open) {
      setMessage(`Check out ${title} at ${company} on Polaris.`);
      setCopiedPlatform("");
    }
  }, [company, open, title]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(message.trim());
  const combined = encodeURIComponent(`${message.trim()} ${url}`.trim());
  const platforms = [
    {
      name: "LinkedIn",
      hint: "Message copied—paste it into your post",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      hint: "Message copied—paste it into your post",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X (Twitter)",
      hint: "Share it in a post",
      href: `https://x.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      hint: "Send it to a chat or group",
      href: `https://wa.me/?text=${combined}`,
    },
  ];

  function openShare(platform: { name: string; href: string }) {
    const shareText = `${message.trim()} ${url}`.trim();
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(shareText)
        .then(() => setCopiedPlatform(platform.name))
        .catch(() => setCopiedPlatform(""));
    }
    window.open(platform.href, "_blank", "noopener,noreferrer");
  }

  return createPortal(
    <div
      className="share-job-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-job-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <article className="share-job-modal">
        <button
          className="share-job-close"
          type="button"
          aria-label="Close share dialog"
          onClick={onClose}
        >
          <Close />
        </button>
        <p className="eyebrow">Share this role</p>
        <h2 id="share-job-title">Help someone find their next move</h2>
        <p>
          {title} · {company}
        </p>
        <label htmlFor="share-job-message">Add a message</label>
        <textarea
          id="share-job-message"
          value={message}
          maxLength={280}
          rows={4}
          onChange={(event) => setMessage(event.target.value)}
        />
        <small>{message.length}/280</small>
        <div className="share-platforms">
          {platforms.map((platform) => (
            <button
              type="button"
              key={platform.name}
              onClick={() => openShare(platform)}
            >
              <Share />
              <span>
                <b>Share to {platform.name}</b>
                <small>
                  {copiedPlatform === platform.name
                    ? "Custom message copied ✓"
                    : platform.hint}
                </small>
              </span>
            </button>
          ))}
        </div>
      </article>
    </div>,
    document.body,
  );
}
