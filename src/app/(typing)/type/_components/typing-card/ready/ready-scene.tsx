import { useHotkeys } from "react-hotkeys-hook";
import { useBuiltMapState } from "@/app/(typing)/type/_lib/atoms/state";
import { H2 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { playYTPlayer } from "../../../_lib/atoms/yt-player";
import { ReadyInputModeRadioCards } from "./input-mode-radio-cards";
import { ReadyPlaySpeed } from "./min-play-speed-counter";
import { ReadyPracticeButton } from "./practice-button";

interface ReadyProps {
  className: string;
}

export const ReadyScene = ({ className }: ReadyProps) => {
  const map = useBuiltMapState();

  useHotkeys(
    "Enter",
    () => {
      if (isDialogOpen() || !map) return;
      playYTPlayer();
    },
    { enableOnFormTags: ["radio"], preventDefault: true },
  );

  return (
    <div className={cn("flex flex-col justify-between select-none", className)}>
      <H2 className="text-4xl md:text-2xl">Enterキー / 動画をクリックして開始</H2>
      <ReadyInputModeRadioCards />
      <div className="flex justify-between text-center">
        <ReadyPlaySpeed />
        <ReadyPracticeButton />
      </div>
    </div>
  );
};
