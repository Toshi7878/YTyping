import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useGetMyRankingResult } from "@/app/(typing)/type/_lib/hooks/getMyRankingResult";
import { useResultPlay } from "@/app/(typing)/type/_lib/hooks/resultPlay";
import { Button } from "@/components/ui/button";
import { useGlobalLoadingOverlay } from "@/lib/globalAtoms";

const ReadyPracticeButton = () => {
  const map = useMapState();

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

export default ReadyPracticeButton;
