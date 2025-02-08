import { clientApi } from "@/trpc/client-api";
import { useRefs } from "../../type-contexts/refsProvider";

export function useSendUserStats() {
  const { statusRef } = useRefs();
  const upsertTypingStats = clientApi.userTypingStats.upsert.useMutation();

  return () => {
    const romaType = statusRef.current?.status.romaType ?? 0;
    const kanaType = statusRef.current?.status.kanaType ?? 0;
    const flickType = statusRef.current?.status.flickType ?? 0;
    const englishType = statusRef.current?.status.englishType ?? 0;
    const numType = statusRef.current?.status.numType ?? 0;
    const symbolType = statusRef.current?.status.symbolType ?? 0;
    const spaceType = statusRef.current?.status.spaceType ?? 0;
    const typingTime = statusRef.current?.status.totalTypeTime ?? 0;

    upsertTypingStats.mutate({
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
}
