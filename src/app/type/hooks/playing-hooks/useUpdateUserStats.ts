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
    const romaType = statusRef.current?.userStats.romaType ?? 0;
    const kanaType = statusRef.current?.userStats.kanaType ?? 0;
    const flickType = statusRef.current?.userStats.flickType ?? 0;
    const englishType = statusRef.current?.userStats.englishType ?? 0;
    const numType = statusRef.current?.userStats.numType ?? 0;
    const symbolType = statusRef.current?.userStats.symbolType ?? 0;
    const spaceType = statusRef.current?.userStats.spaceType ?? 0;
    const typingTime = statusRef.current?.userStats.totalTypeTime ?? 0;

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
