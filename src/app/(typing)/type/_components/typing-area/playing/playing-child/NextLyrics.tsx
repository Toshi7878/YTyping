import { useNextLyricsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import parse from "html-react-parser";

const NextLyrics = () => {
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <div
      id="next_lyrics_kpm"
      className={cn(
        "text-foreground lyrics-font opacity-60",
        "text-4xl sm:text-5xl md:text-3xl",
        "ml-1 leading-[80px] sm:leading-[50px] md:leading-10",
      )}
    >
      <div id="next_lyrics" className={cn("flex items-end font-bold whitespace-nowrap", "text-[110%]")}>
        {parse(lyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </div>
      <div id="next_kpm" className="ml-0.5 text-[90%]">
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : ""}
      </div>
    </div>
  );
};

export default NextLyrics;
