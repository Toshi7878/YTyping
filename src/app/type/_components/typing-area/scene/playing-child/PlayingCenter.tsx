import { usePressSkip } from "@/app/type/hooks/playing-hooks/usePressSkip";
import { skipAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import "@/styles/type.css";
import { VStack } from "@chakra-ui/react";
import { useStore } from "jotai";
import { CARD_BODY_MIN_HEIGHT } from "../../TypingCard";
import PlayingChangeCSS from "./child/PlayingChangeCSS";
import PlayingLyrics from "./child/PlayingLyrics";
import NextLyrics from "./child/PlayingNextLyrics";
import PlayingTypingWords from "./child/PlayingTypingWords";

interface PlayingCenterProps {
  flex: string;
}

const PlayingCenter = ({ flex }: PlayingCenterProps) => {
  const { gameStateRef } = useRefs();

  const playMode = gameStateRef.current!.playMode;

  const pressSkip = usePressSkip();
  const typeAtomStore = useStore();

  return (
    <VStack
      sx={{ cursor: playMode === "playing" ? "none" : "auto" }}
      flex={flex}
      isTruncated
      ml={-2}
      align="start"
      minH={CARD_BODY_MIN_HEIGHT}
      justifyContent="space-between"
      style={{ userSelect: "none", cursor: "none" }}
      id="typing_scene"
      onTouchStart={() => {
        const skip = typeAtomStore.get(skipAtom);
        // タップ時の処理をここに記述

        if (skip) {
          pressSkip();
        }
      }}
    >
      <PlayingTypingWords />
      <PlayingLyrics />
      <NextLyrics />
      <PlayingChangeCSS />
    </VStack>
  );
};

export default PlayingCenter;
