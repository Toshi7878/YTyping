import parse from "html-react-parser";
import { useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { useLyricsState } from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";

export const Lyrics = () => {
  const lyrics = useLyricsState();
  const typingOptions = useTypingOptionsState();

  return (
    <div
      id="lyrics"
      className={cn(
        "text-word-word w-full max-w-[103%] whitespace-nowrap",
        "text-7xl font-bold md:text-[2.5rem]",
        "font-[system-ui]",
        typingOptions.lineCompletedDisplay === "NEXT_WORD" && "[.word-area-completed+&]:invisible",
      )}
    >
      {parse(lyrics)}
      <ruby className="invisible">
        あ<rt>あ</rt>
      </ruby>
    </div>
  );
};
