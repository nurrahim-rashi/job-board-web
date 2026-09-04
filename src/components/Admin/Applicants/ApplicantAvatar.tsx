import { avatarUrl, initials } from "./applicantHelpers";

type ApplicantAvatarProps = { name: string; avatar: string | null; size?: "sm" | "lg" };

export function ApplicantAvatar({ name, avatar, size = "sm" }: ApplicantAvatarProps) {
  const src = avatarUrl(avatar);

  return (
    <span className={`applicant-avatar ${size}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" /> : <i>{initials(name)}</i>}
    </span>
  );
}
