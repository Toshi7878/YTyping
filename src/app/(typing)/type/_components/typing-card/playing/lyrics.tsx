import parse from "html-react-parser";
import { useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { cn } from "@/lib/utils";
import { useLyricsState } from "../../../_lib/atoms/typing-word";

export const Lyrics = () => {
  const lyrics = useLyricsState();
  const typingOptions = useTypingOptionsState();

  return (
    <div
      id="lyrics"
      className={cn(
        "w-full max-w-[103%] whitespace-nowrap text-word-word",
        "font-bold text-7xl md:text-[2.5rem]",
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
