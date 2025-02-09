import { clientApi } from "@/trpc/client-api";
import { useParams } from "next/navigation";
import { DEFAULT_STATUS_REF } from "../../ts/const/typeDefaultValue";
import { useRefs } from "../../type-contexts/refsProvider";

export function useUpdateUserStats() {
  const { id: mapId } = useParams();
  const { statusRef } = useRefs();
  const incrementTypingStats = clientApi.userStats.incrementTypingStats.useMutation();
  const incrementPlayCountStats = clientApi.userStats.incrementPlayCountStats.useMutation();

  const updatePlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };
  const updateTypingStats = () => {
    const userStats = statusRef.current!.userStats;
    const maxCombo = statusRef.current!.status.maxCombo;

    incrementTypingStats.mutate({
      ...userStats,
    });

    statusRef.current!.userStats = structuredClone(DEFAULT_STATUS_REF.userStats);
    statusRef.current!.userStats.maxCombo = structuredClone(maxCombo);
  };

  return { updatePlayCountStats, updateTypingStats };
}
