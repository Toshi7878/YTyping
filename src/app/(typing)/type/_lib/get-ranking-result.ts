import type { Session } from "next-auth";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import { readMapId } from "./atoms/hydrate";

export const getRankingMyResult = (session: Session | null) => {
  const mapId = readMapId();
  if (!session?.user || !mapId) return null;
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();

  const rankingData = queryClient.getQueryData(trpc.resultList.getMapRanking.queryOptions({ mapId }).queryKey);
  if (!rankingData) return null;
  const myResult = rankingData.find((result) => result.player.id === Number(session.user.id));
  return myResult ?? null;
};

export const getRankingResultByResultId = (resultId: number) => {
  const mapId = readMapId();
  if (!mapId) return null;
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();

  const rankingData = queryClient.getQueryData(trpc.resultList.getMapRanking.queryOptions({ mapId }).queryKey);
  if (!rankingData) return null;
  const myResult = rankingData.find((result) => result.id === resultId);
  return myResult ?? null;
};
