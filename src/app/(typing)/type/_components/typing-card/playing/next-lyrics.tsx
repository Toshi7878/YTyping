import parse from "html-react-parser";
import { cn } from "@/lib/utils";
import { useNextLyricsState } from "../../../_lib/atoms/typing-word";

export const NextLyrics = () => {
  const { lyrics, kpm } = useNextLyricsState();

  return (
    <div
      id="next_lyrics_kpm"
      className={cn(
        "mt-4 font-[system-ui] text-5xl text-card-foreground leading-14 opacity-60 md:text-3xl md:leading-10",
      )}
    >
      <div id="next_lyrics" className={"flex items-end whitespace-nowrap font-bold text-[110%]"}>
        {"\u200B"}
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
