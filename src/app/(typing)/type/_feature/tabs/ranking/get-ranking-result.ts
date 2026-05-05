import type { Session } from "@/lib/auth-client";
import { getQueryClient, getTRPCOptions } from "@/trpc/provider";
import { getMapId } from "../../provider";

export const getRankingMyResult = ({ mapId, session }: { mapId: number; session: Session }) => {
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();

  const rankingData = queryClient.getQueryData(trpc.result.list.getRanking.queryOptions({ mapId }).queryKey);
  if (!rankingData) return null;
  const myResult = rankingData.find((result) => result.player.id === session.user.id);
  return myResult ?? null;
};

export const getRankingResultByResultId = ({ mapId, resultId }: { mapId: number; resultId: number }) => {
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();

  const rankingData = queryClient.getQueryData(trpc.result.list.getRanking.queryOptions({ mapId }).queryKey);
  if (!rankingData) return null;
  const playerResult = rankingData.find((result) => result.id === resultId);
  return playerResult ?? null;
};

export const getRankingData = () => {
  const mapId = getMapId();
  if (!mapId) return [];
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();
  const ranking = queryClient.getQueryData(trpc.result.list.getRanking.queryOptions({ mapId: mapId ?? 0 }).queryKey);
  return ranking ?? [];
};
