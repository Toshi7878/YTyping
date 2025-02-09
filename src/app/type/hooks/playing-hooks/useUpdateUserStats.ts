import { clientApi } from "@/trpc/client-api";
import { useParams } from "next/navigation";
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

    incrementTypingStats.mutate({
      ...userStats,
    });
  };

  return { updatePlayCountStats, updateTypingStats };
}
