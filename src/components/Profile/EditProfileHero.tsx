import type { ReactNode } from "react";
import { Stars } from "../site/Stars";

type EditProfileHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  admin?: boolean;
};

export function EditProfileHero({
  eyebrow,
  title,
  description,
  action,
  admin = false,
}: EditProfileHeroProps) {
  return (
    <section className={`edit-profile-hero${admin ? " is-admin" : ""}`}>
      <div className="night-sky" />
      <Stars />
      <div className="edit-profile-hero-inner">
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {action && <div className="edit-profile-hero-action">{action}</div>}
      </div>
    </section>
  );
}
