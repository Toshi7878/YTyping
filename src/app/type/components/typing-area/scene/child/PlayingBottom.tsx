import { Box, Flex, HStack, UseDisclosureReturn } from "@chakra-ui/react";
import PlayingLineProgress from "../playing-child/child/PlayingLineProgress";
import PlayingSkipGuide, { SkipGuideRef } from "../playing-child/child/PlayingSkipGuide";
import PlayingTotalTime, { PlayingTotalTimeRef } from "../playing-child/child/PlayingTotalTime";
import {
  useSceneAtom,
  useTypePageSpeedAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import PlayingBottomBadge from "../playing-child/child/PlayingBottomBadge";
import PlayingLineSeekBadge from "../playing-child/child/PlayingLineSeekBadge";
import { useRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import { useRealTimeSpeedChange } from "@/app/type/hooks/playing-hooks/useSpeedChange";
import { useToggleLineList } from "@/app/type/hooks/playing-hooks/useToggleLineList";
import { useMoveLine } from "@/app/type/hooks/playing-hooks/useMoveLine";
import { useChangePracticeSpeed } from "@/app/type/hooks/playing-hooks/usePracticeSpeedChange";

interface PlayingBottomRef {
  drawerClosure: UseDisclosureReturn;

  skipGuideRef: React.RefObject<SkipGuideRef>;
  totalTimeProgressRef: React.RefObject<HTMLProgressElement>;
  playingTotalTimeRef: React.RefObject<PlayingTotalTimeRef>;
}

const PlayingBottom = function ({
  drawerClosure,
  skipGuideRef,
  totalTimeProgressRef,
  playingTotalTimeRef,
}: PlayingBottomRef) {
  const scene = useSceneAtom();
  const speedData = useTypePageSpeedAtom();
  const retry = useRetry();
  const realTimeSpeedChange = useRealTimeSpeedChange();
  const toggleLineListDrawer = useToggleLineList();
  const changePracticeSpeed = useChangePracticeSpeed();
  const { movePrevLine, moveNextLine } = useMoveLine();
  const userOptionsAtom = useUserOptionsAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <>
      <HStack
        justifyContent="space-between"
        mx={2}
        fontWeight="bold"
        className={`${isPlayed ? "" : "invisible"} bottom-card-text`}
      >
        <PlayingSkipGuide ref={skipGuideRef} className="opacity-70" />
        <PlayingTotalTime className="text-2xl font-mono" ref={playingTotalTimeRef} />
      </HStack>
      <Box>
        <PlayingLineProgress ref={totalTimeProgressRef} id="total_progress" />
      </Box>
      <Flex
        justifyContent="space-between"
        mx={3}
        mt={2}
        mb={4}
        fontWeight="bold"
        className={`${isPlayed ? "" : "invisible"}`}
      >
        {scene === "practice" ? (
          <PlayingLineSeekBadge
            badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
            kbdTextPrev="F9-"
            kbdTextNext="+F10"
            onClick={() => {}}
            onClickPrev={() => changePracticeSpeed("down")}
            onClickNext={() => changePracticeSpeed("up")}
          />
        ) : (
          <PlayingBottomBadge
            badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
            kbdText="F10"
            onClick={realTimeSpeedChange}
            isPauseDisabled={true}
            isKbdHidden={scene === "replay" ? true : false}
          />
        )}
        {scene !== "playing" && (
          <>
            <PlayingLineSeekBadge
              badgeText="ライン移動"
              kbdTextPrev="←"
              kbdTextNext="→"
              onClick={() => {}}
              onClickPrev={() => movePrevLine(drawerClosure)}
              onClickNext={() => moveNextLine(drawerClosure)}
            />
            <PlayingBottomBadge
              badgeText="ライン一覧"
              kbdText={userOptionsAtom.toggleInputModeKey === "tab" ? "F1" : "Tab"}
              onClick={() => toggleLineListDrawer(drawerClosure)}
              isPauseDisabled={false}
              isKbdHidden={false}
            />
          </>
        )}

        <PlayingBottomBadge
          badgeText="やり直し"
          kbdText="F4"
          onClick={retry}
          isPauseDisabled={true}
          isKbdHidden={false}
        />
      </Flex>
    </>
  );
};

PlayingBottom.displayName = "PlayingBottom";

export default PlayingBottom;
