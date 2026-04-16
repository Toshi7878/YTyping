import type { ExtractAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { InputMode } from "lyrics-typing-engine";
import type { TypeResult } from "@/validator/result";
import { getTypingGameAtomStore } from "./store";

const store = getTypingGameAtomStore();

const lineSubstatusAtom = atomWithReset({
  // TODO: typeCount / missCountはtypesで求めても問題ないか
  // リプレイの場合100ms毎のlikekpm更新はどうするか
  typeCount: 0,
  missCount: 0,
  types: [] as TypeResult[],
  startSpeed: 1,
  startInputMode: "roma" as InputMode,
});

export const readLineSubstatus = () => store.get(lineSubstatusAtom);
export const writeLineSubstatus = (newLineSubstatus: Partial<ExtractAtomValue<typeof lineSubstatusAtom>>) =>
  store.set(lineSubstatusAtom, (prev) => ({ ...prev, ...newLineSubstatus }));
export const resetLineSubstatus = () => store.set(lineSubstatusAtom, RESET);
