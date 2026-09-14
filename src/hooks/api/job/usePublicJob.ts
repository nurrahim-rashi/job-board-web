import { useQuery } from "@tanstack/react-query";

import { getPublicJob } from "../../../services/job.service";

export const usePublicJob = (slug: string | undefined) =>
  useQuery({
    queryKey: ["jobs", "public", slug],
    enabled: Boolean(slug),
    queryFn: () => getPublicJob(slug!),
  });
