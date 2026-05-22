import { atom, type ExtractAtomValue, useAtomValue } from "jotai";
import { atomWithReset, RESET, selectAtom } from "jotai/utils";
import { focusAtom } from "jotai-optics";
import { useState } from "react";
import { handleEnterAddRuby } from "@/app/edit/_feature/tabs/editor/enter-add-ruby";
import { FloatingLabelInput } from "@/ui/input/floating-label-input";
import { Input, UncontrolledInput } from "@/ui/input/input";
import { TooltipWrapper } from "@/ui/tooltip";
import { endLineIndexAtom } from "../../map-table/map-table";
import { store } from "../../provider";

const selectLineAtom = atomWithReset({
  selectIndex: null as number | null,
  lyrics: "",
  word: "",
});

interface WriteLineSetAction {
  type: "set";
  line: ExtractAtomValue<typeof selectLineAtom> & { time: string | number };
}

interface ResetLineAction {
  type: "reset";
}

const setSelectLineAtom = atom(null, (_, set, action: WriteLineSetAction | ResetLineAction) => {
  if (action.type === "set" && "line" in action) {
    const { time, ...lineAtomData } = action.line;
    set(selectLineAtom, lineAtomData);
    setTimeValue(String(time));
  } else if (action.type === "reset") {
    set(selectLineAtom, RESET);
    setTimeValue("");
  }
});

const selectLineLyricsAtom = focusAtom(selectLineAtom, (optic) => optic.prop("lyrics"));
const selectLineWordAtom = focusAtom(selectLineAtom, (optic) => optic.prop("word"));
const selectLineIndexAtom = focusAtom(selectLineAtom, (optic) => optic.prop("selectIndex"));

export const getSelectIndex = () => store.get(selectLineIndexAtom);
export const useIsSelectedLine = (index: number) => {
  const isSelectedAtom = selectAtom(selectLineIndexAtom, (s) => s === index);
  return useAtomValue(isSelectedAtom, { store });
};

export const dispatchLine = (action: WriteLineSetAction | ResetLineAction) => store.set(setSelectLineAtom, action);
export const getSelectLine = () => store.get(selectLineAtom);

export const useLyricsState = () => useAtomValue(selectLineLyricsAtom, { store });
export const setLyrics = (value: ExtractAtomValue<typeof selectLineLyricsAtom>) =>
  store.set(selectLineLyricsAtom, value);

export const useWordState = () => useAtomValue(selectLineWordAtom, { store });
export const setWord = (value: ExtractAtomValue<typeof selectLineWordAtom>) => store.set(selectLineWordAtom, value);

export const isUnselectLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom);
  return selectIndex === null;
});

export const isSelectFirstLineAtom = atom((get) => {
  const selectIndex = get(selectLineIndexAtom);
  return selectIndex === 0;
});

export const isSelectEndLineAtom = atom((get) => {
  const endLineIndex = get(endLineIndexAtom);
  const selectIndex = get(selectLineIndexAtom);

  return selectIndex === endLineIndex;
});

export const LyricsInput = () => {
  const [isLineLyricsSelected, setIsLineLyricsSelected] = useState(false);
  const lyrics = useLyricsState();

  return (
    <TooltipWrapper label="Enterキーを押すとRubyタグを挿入できます。" open={isLineLyricsSelected} asChild>
      <FloatingLabelInput
        label="歌詞"
        className="h-8"
        autoComplete="off"
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        onKeyDown={handleEnterAddRuby}
        onSelect={(e) => {
          const start = e.currentTarget.selectionStart;
          const end = e.currentTarget.selectionEnd;
          const isSelected = end !== null && start !== null && end - start > 0;
          setIsLineLyricsSelected(isSelected);
        }}
        onBlur={() => setIsLineLyricsSelected(false)}
      />
    </TooltipWrapper>
  );
};

export const WordInput = () => {
  const word = useWordState();

  return (
    <FloatingLabelInput
      label="ワード"
      className="h-8"
      autoComplete="off"
      value={word}
      onChange={(e) => setWord(e.target.value)}
    />
  );
};

export const SelectedLineIndex = () => {
  const selectedLineIndex = useAtomValue(selectLineIndexAtom);
  return (
    <Input
      placeholder="No."
      className="h-8 w-[90px] bg-muted/50 opacity-100"
      readOnly
      value={selectedLineIndex ?? ""}
    />
  );
};

const timeAtom = atom("0");
export const isEmptyTimeAtom = atom((get) => get(timeAtom) === "");

export const getTimeValue = () => store.get(timeAtom);
export const setTimeValue = (value: string) => store.set(timeAtom, value);

export const TimeInput = () => {
  return (
    <UncontrolledInput
      className="h-8 w-[90px]"
      type="number"
      value={timeAtom}
      onChange={(e) => setTimeValue(e.currentTarget.value)}
      onKeyDown={(e) => {
        const { value } = e.currentTarget;

        if (e.code === "ArrowDown") {
          const newValue = (Number(value) - 0.05).toFixed(3);
          setTimeValue(newValue);
          e.preventDefault();
        } else if (e.code === "ArrowUp") {
          const newValue = (Number(value) + 0.05).toFixed(3);
          setTimeValue(newValue);
          e.preventDefault();
        }
      }}
    />
  );
};
