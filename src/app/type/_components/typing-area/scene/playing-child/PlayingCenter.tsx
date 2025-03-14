import { skipAtom } from "@/app/type/atoms/stateAtoms";
import { usePressSkip } from "@/app/type/hooks/playing-hooks/usePressSkip";
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
  const typeAtomStore = useStore();

  const pressSkip = usePressSkip();

  return (
    <VStack
      cursor="none"
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
