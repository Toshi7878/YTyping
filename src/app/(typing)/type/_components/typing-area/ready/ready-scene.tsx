import { useEffect, useRef } from "react";
import { usePlayer } from "@/app/(typing)/type/_lib/atoms/read-atoms";
import { useMapState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { ReadyInputModeRadioCards } from "./ready-child/input-mode-radio-cards";
import { ReadyPlaySpeed } from "./ready-child/min-play-speed-counter";
import { ReadyPracticeButton } from "./ready-child/practice-button";

interface ReadyProps {
  className?: string;
}

export const ReadyScene = ({ className }: ReadyProps) => {
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);
  const map = useMapState();
  const { readPlayer } = usePlayer();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isOpenDialog = !!document.querySelector("[role='dialog']");
      if (isOpenDialog) return;

      switch (event.code) {
        case "Enter": {
          const player = readPlayer();
          if (player && map) {
            player.playVideo();
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
  }, [readPlayer(), map]);

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
