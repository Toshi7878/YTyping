import { useTRPC } from "@/trpc/provider";
import { useMutation } from "@tanstack/react-query";
import { useUserStats } from "../atoms/read-atoms";

export const useUpdateTypingStats = () => {
  const trpc = useTRPC();
  const updateTypingStats = useMutation(trpc.userStats.incrementImeStats.mutationOptions());
  const { readUserStats, resetUserStats } = useUserStats();

  return async () => {
    const { imeTypeCount, typingTime } = readUserStats();

    updateTypingStats.mutate({ imeTypeCount, typingTime });

    resetUserStats();
  };
};
