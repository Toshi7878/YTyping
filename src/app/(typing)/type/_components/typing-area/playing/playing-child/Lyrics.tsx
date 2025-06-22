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
        "ml-1 flex w-full max-w-[103%] items-end whitespace-nowrap",
        "text-5xl font-bold sm:text-4xl md:text-5xl",
        "lyrics-font",
        // 条件付きスタイル: 完了した単語エリアの後の歌詞を非表示にする
        userOptionsAtom.line_completed_display === "NEXT_WORD" && "[.word-area-completed_+_&]:invisible",
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
