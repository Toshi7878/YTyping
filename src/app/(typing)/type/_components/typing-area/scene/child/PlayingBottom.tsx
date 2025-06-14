import { useSceneGroupState, useYTStartedState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link/link";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { useParams } from "next/navigation";
import Progress from "./Progress";
import PlayingSkipGuide from "./bottom-child/PlayingSkipGuide";
import PlayingTotalTime from "./bottom-child/PlayingTotalTime";
import PracticeBadges from "./bottom-child/child/PracticeBadgeLayout";
import RetryBadge from "./bottom-child/child/RetryBadge";
import SpeedBadge from "./bottom-child/child/SpeedBadge";

const PlayingBottom = function () {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();

  return (
    <>
      <div
        className="bottom-card-text mx-2 flex items-center justify-between text-5xl font-bold sm:text-[2.5rem] md:text-xl"
        style={{ visibility: isPlayed ? "visible" : "hidden" }}
      >
        <PlayingSkipGuide />
        <PlayingTotalTime />
      </div>
      <div>
        <Progress id="total_progress" />
      </div>
      <div
        className="mx-3 mt-2 mb-4 flex justify-between font-bold"
        style={{ visibility: isPlayed ? "visible" : "hidden" }}
      >
        <SpeedBadge />
        <PracticeBadges />
        <RetryBadge />
      </div>
      {sceneGroup === "Ready" && (
        <Link href={`/ime/${mapId}`} onClick={(event) => handleLinkClick(event, "replace")}>
          <Button className="absolute right-10 bottom-3 p-8 text-2xl md:p-2 md:text-base">変換有りタイピング</Button>
        </Link>
      )}
    </>
  );
};

export default PlayingBottom;
