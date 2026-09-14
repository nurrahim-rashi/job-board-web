import { useEffect, useState } from "react";
import { Close, Share } from "../site/Icons";

type ShareJobModalProps = {
  open: boolean;
  title: string;
  company: string;
  url: string;
  onClose: () => void;
};

export function ShareJobModal({ open, title, company, url, onClose }: ShareJobModalProps) {
  const [message, setMessage] = useState(`Check out ${title} at ${company} on Polaris.`);

  useEffect(() => {
    if (open) setMessage(`Check out ${title} at ${company} on Polaris.`);
  }, [company, open, title]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(message.trim());
  const combined = encodeURIComponent(`${message.trim()} ${url}`.trim());
  const platforms = [
    { name: "LinkedIn", hint: "Share with your professional network", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedMessage}` },
    { name: "Facebook", hint: "Post it to your feed", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}` },
    { name: "Twitter", hint: "Share it in a post", href: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}` },
    { name: "WhatsApp", hint: "Send it to a chat or group", href: `https://wa.me/?text=${combined}` },
  ];

  return <div className="share-job-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-job-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="share-job-modal">
      <button className="share-job-close" type="button" aria-label="Close share dialog" onClick={onClose}><Close /></button>
      <p className="eyebrow">Share this role</p>
      <h2 id="share-job-title">Help someone find their next move</h2>
      <p>{title} · {company}</p>
      <label htmlFor="share-job-message">Add a message</label>
      <textarea id="share-job-message" value={message} maxLength={280} rows={4} onChange={(event) => setMessage(event.target.value)} />
      <small>{message.length}/280</small>
      <div className="share-platforms">
        {platforms.map((platform) => <a key={platform.name} href={platform.href} target="_blank" rel="noreferrer"><Share /><span><b>{platform.name}</b><small>{platform.hint}</small></span></a>)}
      </div>
    </article>
  </div>;
}
