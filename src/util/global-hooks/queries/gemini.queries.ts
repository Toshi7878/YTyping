import { clientApi } from "@/trpc/client-api";

interface UseGenerateMapInfoQueryProps {
  videoId: string;
}

export const useGeminiQueries = {
  generateMapInfo: ({ videoId }: UseGenerateMapInfoQueryProps, { enabled }: { enabled: boolean }) =>
    clientApi.gemini.generateMapInfo.useQuery(
      { videoId: videoId },
      {
        enabled,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
};
