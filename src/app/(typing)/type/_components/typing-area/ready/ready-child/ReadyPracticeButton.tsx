import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/(typing)/type/_lib/hooks/loadResultPlay";
import { Button } from "@/components/ui/button";

const ReadyPracticeButton = () => {
  const map = useMapState();
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const handleClick = useLoadResultPlay({
    startMode: "practice",
    resultId: readGameUtilRefParams().practiceMyResultId || null,
  });

  return (
    <Button
      variant="outline"
      className="hover:bg-secondary/80 h-auto px-16 py-6 text-5xl md:text-3xl"
      onClick={map ? handleClick : undefined}
    >
      練習モードで開始
    </Button>
  );
};

export default ReadyPracticeButton;
