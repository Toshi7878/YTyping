import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/hooks/getMyRankingResult";
import { useResultPlay } from "@/app/(typing)/type/_lib/hooks/resultPlay";
import { Button } from "@/components/ui/button";
import { useLoadingOverlay } from "@/lib/globalAtoms";

const ReadyPracticeButton = () => {
  const map = useMapState();

  const getMyRankingResult = useGetMyRankingResult();
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
              await handleClick(getMyRankingResult()?.id ?? null);
            }
          : undefined
      }
    >
      練習モードで開始
    </Button>
  );
};

export default ReadyPracticeButton;
