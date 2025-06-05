import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { useUserStats } from "../atom/refAtoms";

export const useUpdateTypingStats = () => {
  const trpc = useTRPC();
  const updateTypingStats = useMutation(trpc.userStats.incrementImeStats.mutationOptions());
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
