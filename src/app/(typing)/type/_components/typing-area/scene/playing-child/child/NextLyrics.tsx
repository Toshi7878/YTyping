import { useNextLyricsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import parse from "html-react-parser";

const NextLyrics = () => {
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <div
      id="next_lyrics_kpm"
      className={cn(
        "text-foreground opacity-60 lyrics-font",
        "text-4xl sm:text-5xl md:text-3xl",
        "leading-[80px] sm:leading-[50px] md:leading-10"
      )}
    >
      <div
        id="next_lyrics"
        className={cn(
          "flex items-end ml-6 font-bold whitespace-nowrap",
          "text-[110%]"
        )}
      >
        {parse(lyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </div>
      <div
        id="next_kpm"
        className="ml-8 text-[90%]"
      >
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : ""}
      </div>
    </div>
  );
};

export default NextLyrics;
