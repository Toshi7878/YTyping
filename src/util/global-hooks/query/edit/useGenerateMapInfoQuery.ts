import useHasEditPermission from "@/app/edit/hooks/useUserEditPermission";
import { clientApi } from "@/trpc/client-api";
import { useSearchParams } from "next/navigation";

interface UseGenerateMapInfoQueryProps {
  videoId: string;
}

export const useGenerateMapInfoQuery = ({ videoId }: UseGenerateMapInfoQueryProps) => {
  const searchParams = useSearchParams();
  const isBackUp = searchParams.get("backup") === "true";
  const hasEditPermission = useHasEditPermission();

  return clientApi.gemini.generateMapInfo.useQuery(
    { videoId: videoId },
    {
      enabled: !isBackUp && hasEditPermission,
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};
