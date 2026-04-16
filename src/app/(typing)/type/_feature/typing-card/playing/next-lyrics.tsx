import parse from "html-react-parser";
import { useAtomValue } from "jotai/react";
import { atomWithReset } from "jotai/vanilla/utils";
import type { BuiltMapLine } from "lyrics-typing-engine";
import { cn } from "@/lib/utils";
import { getTypingGameAtomStore } from "../../atoms/store";
import { getPlayingInputMode } from "../../atoms/typing-word";
import { getTypingOptions } from "../../tabs/setting/popover";
import { getMediaSpeed } from "../../youtube/youtube-player";

const nextLyricsAtom = atomWithReset("");

const nextKpmAtom = atomWithReset(0);

const store = getTypingGameAtomStore();
export const setNextLyricsAndKpm = (line: BuiltMapLine) => {
  const typingOptions = getTypingOptions();
  const inputMode = getPlayingInputMode();
  const playSpeed = getMediaSpeed();
  const nextKpm = (inputMode === "roma" ? line.kpm.roma : line.kpm.kana) * playSpeed;
  const nextLyrics = typingOptions.nextDisplay === "WORD" ? line.kanaLyrics : line.lyrics;
  if (line.kanaLyrics) {
    store.set(nextKpmAtom, nextKpm);
    store.set(nextLyricsAtom, nextLyrics);
  } else {
    store.set(nextKpmAtom, 0);
    store.set(nextLyricsAtom, "");
  }
};

export const NextLyrics = () => {
  const nextKpm = useAtomValue(nextKpmAtom, { store });
  const nextLyrics = useAtomValue(nextLyricsAtom, { store });
  return (
    <div
      id="next_lyrics_kpm"
      className={cn(
        "mt-4 font-[system-ui] text-5xl text-card-foreground leading-14 opacity-60 md:text-3xl md:leading-10",
      )}
    >
      <div id="next_lyrics" className={"flex items-end whitespace-nowrap font-bold text-[110%]"}>
        {parse(nextLyrics)}
        <ruby className="invisible">
          あ<rt>あ</rt>
        </ruby>
      </div>
      <div id="next_kpm" className="text-[90%]">
        {nextKpm > 0 ? `NEXT: ${nextKpm}kpm` : "\u200B"}
      </div>
    </div>
  );
};
