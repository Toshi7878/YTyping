import type { ExtractAtomValue } from "jotai";
import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { BuiltMapLine } from "lyrics-typing-engine";
import type z from "zod/v4";
import type { LineOptionSchema } from "@/validator/map/raw-map-json";
import type { TypingLineResult } from "@/validator/result";
import { store } from "./store";

export const builtMapAtom = atomWithReset<{
  lines: BuiltMapLine<z.infer<typeof LineOptionSchema>>[];
  totalNotes: { roma: number; kana: number };
  keyRate: number;
  missRate: number;
  initialLineResults: TypingLineResult[];
  typingLineIndexes: number[];
  changeCSSIndexes: number[];
  duration: number;
  hasAlphabet: boolean;
  isCaseSensitive: boolean;
} | null>(null);
export type BuiltMap = ExtractAtomValue<typeof builtMapAtom>;
export const useBuiltMapState = () => useAtomValue(builtMapAtom);
export const setBuiltMap = (map: BuiltMap) => store.set(builtMapAtom, map);
export const resetBuiltMap = () => store.set(builtMapAtom, RESET);
//TODO: builitMapがnullの場合にエラーハンドリング
export const getBuiltMap = () => store.get(builtMapAtom);
export const setLastLineEndTime = (map: NonNullable<BuiltMap>, endTime: number) => {
  const lines = map.lines.map((line, i) => (i === map.lines.length - 1 ? { ...line, time: endTime } : line));
  store.set(builtMapAtom, { ...map, lines, duration: Math.min(map.duration, endTime) });
};
