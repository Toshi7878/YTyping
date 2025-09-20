import { useLyricsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import parse from "html-react-parser";

const Lyrics = () => {
  const lyrics = useLyricsState();
  const userOptionsAtom = useUserTypingOptionsState();

  return (
    <div
      id="lyrics"
      className={cn(
        "text-word-word w-full max-w-[103%] whitespace-nowrap",
        "text-6xl font-bold md:text-[2.5rem]",
        "font-[system-ui]",
        userOptionsAtom.lineCompletedDisplay === "NEXT_WORD" && "[.word-area-completed_+_&]:invisible",
      )}
    >
      {parse(lyrics)}
      <ruby className="invisible">
        あ<rt>あ</rt>
      </ruby>
    </div>
  );
};

export default Lyrics;
