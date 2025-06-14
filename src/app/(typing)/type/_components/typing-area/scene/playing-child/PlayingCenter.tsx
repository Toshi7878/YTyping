import { useReadGameUtilParams } from "@/app/(typing)/type/atoms/stateAtoms";
import { usePressSkip } from "@/app/(typing)/type/hooks/playing-hooks/pressSkip";
import { CARD_BODY_MIN_HEIGHT } from "@/app/(typing)/type/ts/const/consts";
import "@/styles/type.css";
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
    <div
      className="flex flex-col justify-between items-start -ml-2 select-none cursor-none truncate"
      style={{ flex: flex, minHeight: CARD_BODY_MIN_HEIGHT.md }}
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
    </div>
  );
};

export default PlayingCenter;
