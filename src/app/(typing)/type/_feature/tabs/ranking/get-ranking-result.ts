import type { Session } from "@/auth/client";
import { getQueryClient, orpc } from "@/orpc/provider";
import { getMapId } from "../../provider";

export const getRankingMyResult = ({ mapId, session }: { mapId: number; session: Session }) => {
  const queryClient = getQueryClient();

  const rankingData = queryClient.getQueryData(orpc.result.ranking.get.queryOptions({ input: { mapId } }).queryKey);
  if (!rankingData) return null;
  const myResult = rankingData.find((result) => result.player.id === session.user.id);
  return myResult ?? null;
};

export const getRankingResultByResultId = ({ mapId, resultId }: { mapId: number; resultId: number }) => {
  const queryClient = getQueryClient();

  const rankingData = queryClient.getQueryData(orpc.result.ranking.get.queryOptions({ input: { mapId } }).queryKey);
  if (!rankingData) return null;
  const playerResult = rankingData.find((result) => result.id === resultId);
  return playerResult ?? null;
};

export const getRankingData = () => {
  const mapId = getMapId();
  if (!mapId) return [];
  const queryClient = getQueryClient();
  const ranking = queryClient.getQueryData(
    orpc.result.ranking.get.queryOptions({ input: { mapId: mapId ?? 0 } }).queryKey,
  );
  return ranking ?? [];
};
