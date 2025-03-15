import { clientApi } from "@/trpc/client-api";
import { useParams } from "next/navigation";
import { useStatusRef, useUserStatsRef } from "../../atoms/refAtoms";

export function useUpdateUserStats() {
  const { id: mapId } = useParams();
  const incrementTypingStats = clientApi.userStats.incrementTypingStats.useMutation();
  const incrementPlayCountStats = clientApi.userStats.incrementPlayCountStats.useMutation();

  const { readUserStatsRef, writeUserStatsRef, resetUserStatsRef } = useUserStatsRef();
  const { readStatusRef } = useStatusRef();

  const updatePlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };
  const updateTypingStats = () => {
    const userStats = readUserStatsRef();
    const maxCombo = readStatusRef().maxCombo;

    incrementTypingStats.mutate({
      ...userStats,
    });

    resetUserStatsRef();
    writeUserStatsRef({ maxCombo: maxCombo });
  };

  return { updatePlayCountStats, updateTypingStats };
}
