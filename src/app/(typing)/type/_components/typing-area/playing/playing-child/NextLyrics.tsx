import { useNextLyricsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import parse from "html-react-parser";

const NextLyrics = () => {
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <div
      id="next_lyrics_kpm"
      className={cn("text-foreground mt-4 font-[system-ui] text-4xl leading-10 opacity-60 md:text-3xl")}
    >
      <div id="next_lyrics" className={"flex items-end text-[110%] font-bold whitespace-nowrap"}>
        {parse(lyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </div>
      <div id="next_kpm" className="text-[90%]">
        {Number(kpm) > 0 ? `NEXT: ${kpm}kpm` : ""}
      </div>
    </div>
  );
};

export default NextLyrics;
