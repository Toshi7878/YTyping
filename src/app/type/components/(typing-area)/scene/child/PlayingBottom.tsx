import { Box, HStack } from "@chakra-ui/react";
import PlayingLineProgress from "./child/PlayingLineProgress";
import PlayingSkipGuide, { SkipGuideRef } from "./child/PlayingSkipGuide";
import PlayingTotalTime, { PlayingTotalTimeRef } from "./child/PlayingTotalTime";
import { sceneAtom, speedAtom } from "@/app/type/(atoms)/gameRenderAtoms";
import { useAtom } from "jotai";
import PlayingBottomBadge from "./child/PlayingBottomBadge";
import { useRefs } from "@/app/type/(contexts)/refsProvider";

interface PlayingBottomRef {
  skipGuideRef: React.RefObject<SkipGuideRef>;
  totalTimeProgressRef: React.RefObject<HTMLProgressElement>;
  playingTotalTimeRef: React.RefObject<PlayingTotalTimeRef>;
}

const PlayingBottom = function ({
  skipGuideRef,
  totalTimeProgressRef,
  playingTotalTimeRef,
}: PlayingBottomRef) {
  const { playingRef } = useRefs();
  const [scene] = useAtom(sceneAtom);
  const [speedData] = useAtom(speedAtom);

  return (
    <Box mx="6">
      <HStack
        justify="space-between"
        className={`mx-1 font-bold ${scene !== "playing" ? "invisible" : ""}`}
      >
        <PlayingSkipGuide ref={skipGuideRef} className="opacity-70" />
        <PlayingTotalTime className="text-2xl font-mono" ref={playingTotalTimeRef} />
      </HStack>
      <PlayingLineProgress ref={totalTimeProgressRef} />
      <HStack
        justify="space-between"
        className={`mx-3 mt-2 mb-4 font-bold ${scene !== "playing" ? "invisible" : ""}`}
      >
        <PlayingBottomBadge
          badgeText={speedData.realtimeSpeed.toFixed(2) + "倍速"}
          kbdText="F10"
          onClick={() => playingRef.current?.realtimeSpeedChange()}
        />
        <PlayingBottomBadge
          badgeText="やり直し"
          kbdText="F4"
          onClick={() => playingRef.current?.retry()}
        />
      </HStack>
    </Box>
  );
};

PlayingBottom.displayName = "PlayingBottom";

export default PlayingBottom;
