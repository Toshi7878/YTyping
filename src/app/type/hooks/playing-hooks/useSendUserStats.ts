import { clientApi } from "@/trpc/client-api";
import { useParams } from "next/navigation";
import { useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";

export function useSendUserStats() {
  const { id: mapId } = useParams();
  const incrementTypingStats = clientApi.userStats.incrementTypingStats.useMutation();
  const incrementPlayCountStats = clientApi.userStats.incrementPlayCountStats.useMutation();

  const { readUserStats, resetUserStats } = useUserStatsRef();
  const { readStatus } = useStatusRef();

  const sendPlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };
  const sendTypingStats = () => {
    const userStats = readUserStats();
    const { maxCombo } = readStatus();

    incrementTypingStats.mutate({
      ...userStats,
    });

    resetUserStats(maxCombo);
  };

  return { sendPlayCountStats, sendTypingStats };
}
