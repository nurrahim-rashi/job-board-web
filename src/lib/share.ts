export type SharePlatform = "LinkedIn" | "Facebook" | "X (Twitter)" | "WhatsApp";

export type ShareTarget = {
  name: SharePlatform;
  hint: string;
  href: string;
  /**
   * LinkedIn and Facebook drop any text passed in the URL and compose from the
   * link's own metadata, so the custom message has to reach them through the
   * clipboard instead.
   */
  carriesMessage: boolean;
};

export type ShareInput = {
  title: string;
  company: string;
  url: string;
  message: string;
};

export function defaultShareMessage(title: string, company: string) {
  return `Check out ${title} at ${company} on Polaris.`;
}

/** What gets copied to the clipboard, and what WhatsApp sends as one blob. */
export function shareText(message: string, url: string) {
  return `${message.trim()} ${url}`.trim();
}

export function buildShareTargets({
  url,
  message,
}: Omit<ShareInput, "title" | "company">): ShareTarget[] {
  const encodedUrl = encodeURIComponent(url);
  const encodedMessage = encodeURIComponent(message.trim());
  const combined = encodeURIComponent(shareText(message, url));

  return [
    {
      name: "LinkedIn",
      hint: "Message copied. Paste it into your post",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      carriesMessage: false,
    },
    {
      name: "Facebook",
      hint: "Message copied. Paste it into your post",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      carriesMessage: false,
    },
    {
      name: "X (Twitter)",
      hint: "Share it in a post",
      href: `https://x.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      carriesMessage: true,
    },
    {
      name: "WhatsApp",
      hint: "Send it to a chat or group",
      href: `https://wa.me/?text=${combined}`,
      carriesMessage: true,
    },
  ];
}
