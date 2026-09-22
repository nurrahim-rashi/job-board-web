import { sanitizeRichTextHtml } from "../../lib/rich-text";

type RichTextProps = {
  html: string;
  className?: string;
};

/** Renders company-profile rich text saved by RichTextEditor. Sanitized on every render. */
export function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={["rich-text", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }}
    />
  );
}
