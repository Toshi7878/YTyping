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
    const romaType = statusRef.current!.userStats.romaType;
    const kanaType = statusRef.current!.userStats.kanaType;
    const flickType = statusRef.current!.userStats.flickType;
    const englishType = statusRef.current!.userStats.englishType;
    const numType = statusRef.current!.userStats.numType;
    const symbolType = statusRef.current!.userStats.symbolType;
    const spaceType = statusRef.current!.userStats.spaceType;
    const typingTime = statusRef.current!.userStats.totalTypeTime;

    incrementTypingStats.mutate({
      romaType,
      kanaType,
      typingTime,
      flickType,
      englishType,
      numType,
      symbolType,
      spaceType,
    });
  };

  return { updatePlayCountStats, updateTypingStats };
}
