"use client";

import { useReadGameUtilParams } from "@/app/(typing)/type/_lib/atoms/stateAtoms";

import { cn } from "@/lib/utils";
import { usePressSkip } from "../../../_lib/hooks/playing-hooks/pressSkip";
import usePlayingKeydownEventListener from "../../../_lib/hooks/playing-hooks/use-playing-keydown-eventlistener";
import useSendUserTypingStats from "../../../_lib/hooks/playing-hooks/use-send-user-typing-stats";
import ChangeCSS from "./playing-child/ChangeCSS";
import Lyrics from "./playing-child/Lyrics";
import NextLyrics from "./playing-child/NextLyrics";
import TypingWords from "./playing-child/PlayingTypingWords";

interface PlayingProps {
  className?: string;
}

const Playing = ({ className }: PlayingProps) => {
  useSendUserTypingStats();
  usePlayingKeydownEventListener();
  const pressSkip = usePressSkip();
  const readGameUtils = useReadGameUtilParams();

  return (
    <div
      className={cn("flex cursor-none flex-col items-start justify-between truncate select-none", className)}
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

export default Playing;
