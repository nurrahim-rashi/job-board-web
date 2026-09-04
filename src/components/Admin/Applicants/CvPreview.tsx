import { useApplicantCv } from "../../../hooks/api/applicant/useApplicantCv";
import { FileText } from "../../site/Icons";

type CvPreviewProps = { slug: string; applicationId: number | null; name: string };

export function CvPreview({ slug, applicationId, name }: CvPreviewProps) {
  const { url, isLoading, error } = useApplicantCv(slug, applicationId);

  return (
    <div className="applicant-cv">
      <div className="applicant-cv-head">
        <p className="eyebrow">CV document</p>
        {url ? (
          <a className="admin-btn ghost" href={url} target="_blank" rel="noreferrer">
            <FileText /> Open in new tab
          </a>
        ) : null}
      </div>
      {isLoading ? (
        <div className="applicant-cv-fallback">Loading the CV…</div>
      ) : error ? (
        <div className="applicant-cv-fallback">{error}</div>
      ) : url ? (
        <iframe src={url} title={`CV of ${name}`} />
      ) : (
        <div className="applicant-cv-fallback">No CV attached to this application.</div>
      )}
    </div>
  );
}
