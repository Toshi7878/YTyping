"use client";
import parse from "html-react-parser";
import { atom, useAtomValue } from "jotai";
import { useTypingOptionsState } from "@/app/(typing)/type/_feature/atoms/hydrate";
import { cn } from "@/lib/utils";
import { getTypingGameAtomStore } from "../../atoms/store";

const lyricsAtom = atom("");
const store = getTypingGameAtomStore();

export const setLyrics = (value: string) => store.set(lyricsAtom, value);
export const Lyrics = () => {
  const lyrics = useAtomValue(lyricsAtom, { store });
  const typingOptions = useTypingOptionsState();

  return (
    <div
      id="lyrics"
      className={cn(
        "w-full whitespace-nowrap text-word-word",
        "text-7xl md:text-[2.5rem]",
        "font-bold [font-family:system-ui]",
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
