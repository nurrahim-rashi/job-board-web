import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  Close,
  Github,
  Globe,
  Instagram,
  WhatsApp,
  XSocial,
} from "../site/Icons";

export type ProfileLink = { label: string; url: string };
type SocialKey = "github" | "instagram" | "x" | "whatsapp" | "website";

const platforms = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/username", Icon: Github },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username", Icon: Instagram },
  { key: "x", label: "X", placeholder: "https://x.com/username", Icon: XSocial },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/628123456789", Icon: WhatsApp },
  { key: "website", label: "Website", placeholder: "https://yourwebsite.com", Icon: Globe },
] as const;

const linkKey = (link: ProfileLink): SocialKey | null => {
  const value = `${link.label} ${link.url}`.toLowerCase();
  if (value.includes("github")) return "github";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("twitter") || value.includes("x.com")) return "x";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "whatsapp";
  if (link.url.toLowerCase().startsWith("mailto:")) return null;
  return "website";
};

export const socialLinkValues = (links: ProfileLink[]) => {
  const values: Record<SocialKey, string> = {
    github: "",
    instagram: "",
    x: "",
    whatsapp: "",
    website: "",
  };
  links.forEach((link) => {
    const key = linkKey(link);
    if (!key) return;
    if (!values[key]) values[key] = link.url;
  });
  return values;
};

export const hasSupportedSocialLinks = (links: ProfileLink[]) =>
  Object.values(socialLinkValues(links)).some(Boolean);

export const socialLinksFromFormData = (form: FormData): ProfileLink[] =>
  platforms.flatMap(({ key, label }) => {
    const url = String(form.get(`social-${key}`) ?? "").trim();
    return url ? [{ label, url }] : [];
  });

export function SocialLinksFields({ links }: { links: ProfileLink[] }) {
  const values = socialLinkValues(links);
  return (
    <fieldset className="profile-social-fields profile-wide">
      <legend>Social links</legend>
      <div>
        {platforms.map(({ key, label, placeholder, Icon }) => (
          <label key={key}>
            <span><Icon /> {label}</span>
            <input
              name={`social-${key}`}
              type="url"
              defaultValue={values[key]}
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SocialLinkIcons({ links }: { links: ProfileLink[] }) {
  const values = socialLinkValues(links);
  return (
    <div className="profile-social-icons" aria-label="Social links">
      {platforms.flatMap(({ key, label, Icon }) =>
        values[key]
          ? [
              <a
                href={values[key]}
                key={key}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
              >
                <Icon />
              </a>,
            ]
          : [],
      )}
    </div>
  );
}

export function SocialLinksModal({
  initialLinks,
  onDismiss,
  onSave,
}: {
  initialLinks: ProfileLink[];
  onDismiss: () => void;
  onSave: (links: ProfileLink[]) => void | Promise<void>;
}) {
  const [values, setValues] = useState(() => socialLinkValues(initialLinks));
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(
        platforms.flatMap(({ key, label }) =>
          values[key].trim() ? [{ label, url: values[key].trim() }] : [],
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="experience-modal" onMouseDown={(event) => event.target === event.currentTarget && onDismiss()}>
      <form className="experience-modal-dialog social-links-modal" role="dialog" aria-modal="true" aria-labelledby="social-links-title" onSubmit={submit}>
        <header>
          <div>
            <p className="eyebrow">Profile links</p>
            <h2 id="social-links-title">Social links</h2>
          </div>
          <button type="button" onClick={onDismiss} aria-label="Close social links"><Close /></button>
        </header>
        <div className="social-links-modal-fields">
          {platforms.map(({ key, label, placeholder, Icon }) => (
            <label key={key}>
              <span><Icon /> {label}</span>
              <input type="url" value={values[key]} placeholder={placeholder} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
            </label>
          ))}
        </div>
        <footer>
          <button type="button" className="experience-modal-dismiss" onClick={onDismiss}>Dismiss</button>
          <button className="profile-submit" disabled={saving}>{saving ? "Saving…" : "Save links"}</button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
