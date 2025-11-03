import { useEffect, useRef } from "react";
import { useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { readYTPlayer } from "../../../_lib/atoms/ref";
import { ReadyInputModeRadioCards } from "./ready-child/input-mode-radio-cards";
import { ReadyPlaySpeed } from "./ready-child/min-play-speed-counter";
import { ReadyPracticeButton } from "./ready-child/practice-button";

interface ReadyProps {
  className?: string;
}

export const ReadyScene = ({ className }: ReadyProps) => {
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);
  const map = useBuiltMapState();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isOpenDialog = !!document.querySelector("[role='dialog']");
      if (isOpenDialog) return;

      switch (event.code) {
        case "Enter": {
          const YTPlayer = readYTPlayer();
          if (YTPlayer && map) {
            YTPlayer.playVideo();
          }
          event.preventDefault();
          break;
        }
        case "F9":
          speedDownButtonRef.current?.click();
          event.preventDefault();

          break;
        case "F10":
          speedUpButtonRef.current?.click();
          event.preventDefault();

          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [map]);

  return (
    <div className={cn("flex flex-col justify-between select-none", className)}>
      <H2 className="text-4xl md:text-2xl">Enterキー / 動画をクリックして開始</H2>

      <ReadyInputModeRadioCards />

      <div className="flex justify-between text-center">
        <ReadyPlaySpeed speedUpButtonRef={speedUpButtonRef} speedDownButtonRef={speedDownButtonRef} />
        <ReadyPracticeButton />
      </div>
    </div>
  );
};
