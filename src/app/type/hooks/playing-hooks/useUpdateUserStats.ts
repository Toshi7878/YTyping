import { clientApi } from "@/trpc/client-api";
import { useStore } from "jotai";
import { RESET } from "jotai/utils";
import { useParams } from "next/navigation";
import { typingStatusRefAtom, userStatsRefAtom } from "../../atoms/refAtoms";

export function useUpdateUserStats() {
  const { id: mapId } = useParams();
  const incrementTypingStats = clientApi.userStats.incrementTypingStats.useMutation();
  const incrementPlayCountStats = clientApi.userStats.incrementPlayCountStats.useMutation();
  const typeAtomStore = useStore();

  const updatePlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };
  const updateTypingStats = () => {
    const userStats = typeAtomStore.get(userStatsRefAtom);
    const maxCombo = typeAtomStore.get(typingStatusRefAtom).maxCombo;

    incrementTypingStats.mutate({
      ...userStats,
    });

    typeAtomStore.set(userStatsRefAtom, RESET);
    typeAtomStore.set(userStatsRefAtom, (prev) => ({
      ...prev,
      maxCombo: structuredClone(maxCombo),
    }));
  };

  return { updatePlayCountStats, updateTypingStats };
}
