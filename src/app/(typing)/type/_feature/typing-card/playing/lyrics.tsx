"use client";
import parse from "html-react-parser";
import { atom, useAtomValue } from "jotai";
import { cn } from "@/utils/cn";
import { store } from "../../atoms/store";
import { useTypingOptionsState } from "../../tabs/setting/popover";

const lyricsAtom = atom("");
export const setLyrics = (value: string) => store.set(lyricsAtom, value);
export const resetLyrics = () => store.set(lyricsAtom, "");

export const Lyrics = () => {
  const lyrics = useAtomValue(lyricsAtom);
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
