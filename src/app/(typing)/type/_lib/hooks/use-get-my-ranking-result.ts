import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMapRankingQueries } from "@/utils/queries/map-ranking.queries";

export const useGetMyRankingResult = () => {
  const { id: mapId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const mapRankingQuery = useMapRankingQueries().mapRanking({ mapId });
  const { data: session } = useSession();

  return () => {
    const results = queryClient.getQueryData(mapRankingQuery.queryKey);

    if (!session?.user?.id || !results) {
      return null;
    }

    const myResult = results.find((result) => result.player.id === Number(session.user.id));
    return myResult ?? null;
  };
};
