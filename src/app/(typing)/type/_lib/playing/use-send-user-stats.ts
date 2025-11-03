import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTRPC } from "@/trpc/provider";
import { readUserStats, resetUserStats } from "../atoms/ref";

export function useSendUserStats() {
  const { id: mapId } = useParams<{ id: string }>();
  const trpc = useTRPC();

  const incrementTypingStats = useMutation(trpc.userStats.incrementTypingStats.mutationOptions());
  const incrementPlayCountStats = useMutation(trpc.userStats.incrementPlayCountStats.mutationOptions());

  const sendPlayCountStats = () => {
    incrementPlayCountStats.mutate({ mapId: Number(mapId) });
  };

  const sendTypingStats = () => {
    const userStats = readUserStats();
    incrementTypingStats.mutate(userStats);
    resetUserStats();
  };

  return { sendPlayCountStats, sendTypingStats };
}
