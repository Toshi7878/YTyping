import { clientApi } from "@/trpc/client-api";
import { useUserStats } from "../atom/refAtoms";

export const useUpdateTypingStats = () => {
  const updateTypingStats = clientApi.userStats.incrementImeStats.useMutation();
  const { readUserStats, resetUserStats } = useUserStats();

  return async () => {
    const { ime_type, total_type_time } = readUserStats();

    updateTypingStats.mutate({
      ime_type,
      total_type_time,
    });

    resetUserStats();
  };
};
