import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useResultPlay } from "@/app/(typing)/type/_lib/hooks/resultPlay";
import { Button } from "@/components/ui/button";
import { useLoadingOverlay } from "@/lib/globalAtoms";
import { useMapRankingQueries } from "@/utils/queries/mapRanking.queries";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const ReadyPracticeButton = () => {
  const map = useMapState();
  const getMyResultId = useGetMyResultId();
  const { showLoading } = useLoadingOverlay();
  const handleClick = useResultPlay({ startMode: "practice" });

  return (
    <Button
      variant="outline"
      className="hover:bg-secondary/80 h-auto px-16 py-6 text-5xl md:text-3xl"
      onClick={
        map
          ? async () => {
              showLoading({ message: "リザルトデータを読込中..." });
              const resultId = await getMyResultId();
              await handleClick(resultId);
            }
          : undefined
      }
    >
      練習モードで開始
    </Button>
  );
};

const useGetMyResultId = () => {
  const { id: mapId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const mapRankingQuery = useMapRankingQueries().mapRanking({ mapId });
  const { data: session } = useSession();

  return async () => {
    const results = await queryClient.ensureQueryData(mapRankingQuery);

    if (!session?.user?.id || !results) {
      return null;
    }

    const myResult = results.find((result) => result.user_id === Number(session.user.id));
    return myResult?.id ?? null;
  };
};

export default ReadyPracticeButton;
