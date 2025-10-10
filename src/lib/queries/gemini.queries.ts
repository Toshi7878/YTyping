import { useTRPC } from "@/trpc/provider";

interface UseGenerateMapInfoQueryProps {
  videoId: string;
}

export const useGeminiQueries = () => {
  const trpc = useTRPC();

  return {
    generateMapInfo: ({ videoId }: UseGenerateMapInfoQueryProps, { enabled }: { enabled: boolean }) =>
      trpc.gemini.generateMapInfo.queryOptions(
        { videoId },
        {
          enabled,
          staleTime: Infinity,
          gcTime: Infinity,
          retry: false,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
        },
      ),
  };
};
