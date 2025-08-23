import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTypingDetails, useUserStats } from "../../atoms/refAtoms";

export function useSendUserStats() {
  const { id: mapId } = useParams() as { id: string };
  const trpc = useTRPC();

  const incrementTypingStats = useMutation(trpc.userStats.incrementTypingStats.mutationOptions());
  const incrementPlayCountStats = useMutation(trpc.userStats.incrementPlayCountStats.mutationOptions());

  const { readUserStats, resetUserStats } = useUserStats();
  const { readStatus } = useTypingDetails();

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
