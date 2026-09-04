import { useEffect, useState } from "react";

import { axiosInstance } from "../../../lib/axios";

type CvState = { url: string | null; isLoading: boolean; error: string | null };

export const useApplicantCv = (slug: string | undefined, applicationId: number | null) => {
  const [state, setState] = useState<CvState>({ url: null, isLoading: false, error: null });

  useEffect(() => {
    if (!slug || applicationId == null) {
      setState({ url: null, isLoading: false, error: null });
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    setState({ url: null, isLoading: true, error: null });

    axiosInstance
      .get<Blob>(`/job-posting/${slug}/applicants/${applicationId}/cv`, { responseType: "blob" })
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        setState({ url: objectUrl, isLoading: false, error: null });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({ url: null, isLoading: false, error: error.message });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [slug, applicationId]);

  return state;
};
