import { usePlayer } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useMapState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useWindowFocus } from "@/utils/global-hooks/windowFocus";
import { useEffect, useRef } from "react";
import ReadyInputModeRadioCards from "./ready-child/ReadyInputModeRadioCards";
import ReadyPlaySpeed from "./ready-child/ReadyPlaySpeed";
import ReadyPracticeButton from "./ready-child/ReadyPracticeButton";

interface ReadyProps {
  className?: string;
}

function Ready({ className }: ReadyProps) {
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);
  const map = useMapState();
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      switch (event.code) {
        case "Enter":
          const player = readPlayer();
          if (player && map) {
            player.playVideo();
            windowFocus();
          }
          event.preventDefault();
          break;
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
    <div className={cn("flex flex-col justify-between", className)}>
      <H3>Enterキー / 動画をクリックして開始</H3>
      <div className="flex justify-center text-center text-3xl">
        <ReadyInputModeRadioCards />
      </div>
      <div className="flex justify-between text-center">
        <ReadyPlaySpeed speedUpButtonRef={speedUpButtonRef as any} speedDownButtonRef={speedDownButtonRef as any} />
        <ReadyPracticeButton />
      </div>
    </div>
  );
}

export default Ready;
