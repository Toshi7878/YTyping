import { useReadGameUtilParams } from "@/app/type/atoms/stateAtoms";
import { usePressSkip } from "@/app/type/hooks/playing-hooks/pressSkip";
import { CARD_BODY_MIN_HEIGHT } from "@/app/type/ts/const/consts";
import "@/styles/type.css";
import { VStack } from "@chakra-ui/react";
import ChangeCSS from "./child/ChangeCSS";
import Lyrics from "./child/Lyrics";
import NextLyrics from "./child/NextLyrics";
import TypingWords from "./child/PlayingTypingWords";

interface PlayingCenterProps {
  flex: string;
}

const PlayingCenter = ({ flex }: PlayingCenterProps) => {
  const pressSkip = usePressSkip();
  const readGameUtils = useReadGameUtilParams();

  return (
    <VStack
      cursor="none"
      flex={flex}
      isTruncated
      ml={-2}
      align="start"
      minH={CARD_BODY_MIN_HEIGHT}
      justifyContent="space-between"
      userSelect="none"
      id="typing_scene"
      onTouchStart={() => {
        const { skip } = readGameUtils();

        if (skip) {
          pressSkip();
        }
      }}
    >
      <TypingWords />
      <Lyrics />
      <NextLyrics />
      <ChangeCSS />
    </VStack>
  );
};

export default PlayingCenter;
