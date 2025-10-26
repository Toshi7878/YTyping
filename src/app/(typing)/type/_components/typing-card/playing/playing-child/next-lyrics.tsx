import parse from "html-react-parser";
import { useNextLyricsState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { cn } from "@/lib/utils";

export const NextLyrics = () => {
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <div
      id="next_lyrics_kpm"
      className={cn(
        "text-card-foreground mt-4 font-[system-ui] text-5xl leading-14 opacity-60 md:text-3xl md:leading-10",
      )}
    >
      <div id="next_lyrics" className={"flex items-end text-[110%] font-bold whitespace-nowrap"}>
        {parse(lyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </div>
      <div id="next_kpm" className="text-[90%]">
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : "\u00A0"}
      </div>
    </div>
  );
};
