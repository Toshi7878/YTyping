import { useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/ranking/use-get-my-ranking-result";
import { useResultPlay } from "@/app/(typing)/type/_lib/ready/use-result-play";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/global-atoms";

export const ReadyPracticeButton = () => {
  const map = useBuiltMapState();

  const getMyRankingResult = useGetMyRankingResult();
  const { showLoading } = useGlobalLoadingOverlay();
  const resultPlay = useResultPlay({ startMode: "practice" });

  const handleClick = () => {
    if (map) {
      showLoading({ message: "リザルトデータを読込中..." });
      void resultPlay(getMyRankingResult()?.id ?? null);
    }
  };

  return (
    <Button variant="outline" className="h-auto px-16 py-6 text-5xl md:text-3xl" onClick={handleClick}>
      練習モードで開始
    </Button>
  );
};
