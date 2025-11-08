import type { Session } from "next-auth";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import { readMapId } from "./atoms/hydrate";

export const getRankingMyResult = (session: Session | null) => {
  if (!session?.user) return null;
  const mapId = readMapId();
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();
  const rankingData = queryClient.getQueryData(trpc.result.getMapRanking.queryOptions({ mapId }).queryKey);
  if (!rankingData) return null;
  const myResult = rankingData.find((result) => result.player.id === Number(session.user.id));
  return myResult ?? null;
};
