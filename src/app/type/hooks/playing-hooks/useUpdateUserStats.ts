import { clientApi } from "@/trpc/client-api";
import { useParams } from "next/navigation";
import { useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";

export function useUpdateUserStats() {
  const { id: mapId } = useParams();
  const incrementTypingStats = clientApi.userStats.incrementTypingStats.useMutation();
  const incrementPlayCountStats = clientApi.userStats.incrementPlayCountStats.useMutation();

  const { readUserStats, resetUserStats } = useUserStatsRef();
  const { readStatus } = useStatusRef();

  const updatePlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };
  const updateTypingStats = () => {
    const userStats = readUserStats();
    const maxCombo = readStatus().maxCombo;

    incrementTypingStats.mutate({
      ...userStats,
    });

    resetUserStats(maxCombo);
  };

  return { updatePlayCountStats, updateTypingStats };
}
