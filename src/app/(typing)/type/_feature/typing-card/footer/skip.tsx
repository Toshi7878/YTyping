import { atom } from "jotai/vanilla";
import { uncontrolled } from "jotai-uncontrolled";
import type { BuiltMapLine } from "lyrics-typing-engine";
import { readTypingOptions } from "../../../_atoms/hydrate";
import { getUtilityRefParams } from "../../../_atoms/ref";
import { getBuiltMap, readMediaSpeed } from "../../../_atoms/state";
import { getTypingGameAtomStore } from "../../../_atoms/store";
import { seekYTPlayer } from "../../../_atoms/youtube-player";

type SkipKey = "Space" | null;

const store = getTypingGameAtomStore();

const skipKeyAtom = atom<SkipKey>(null);
const skipGuideMessageAtom = atom<string>((get) => {
  const activeSkipGuideKey = get(skipKeyAtom);
  return activeSkipGuideKey ? `Type ${activeSkipGuideKey} key to Skip. ⏩` : "";
});

export const getActiveSkipKey = () => store.get(skipKeyAtom);
export const setActiveSkipKey = (value: SkipKey) => store.set(skipKeyAtom, value);

export const SkipGuideMessage = () => {
  return (
    <uncontrolled.div className="opacity-60" id="skip_guide" atomStore={store}>
      {skipGuideMessageAtom}
    </uncontrolled.div>
  );
};

export const skipLine = (count: number) => {
  const map = getBuiltMap();
  if (!map) return;
  const nextLine = map.lines[count + 1];
  if (!nextLine) return;

  if (nextLine.lyrics === "end") {
    const seekTime = getSkipSeekTimeWithEnd(nextLine);
    handleSkip(seekTime);
    return;
  }

  const startCount = map.typingLineIndexes[0] ?? 0;
  if (startCount > count) {
    const seekTime = getSeekTimeWithLineIndex(startCount);
    handleSkip(seekTime);
    return;
  }

  const seekTime = getSeekTimeWithLineIndex(count + 1);
  handleSkip(seekTime);
};

const handleSkip = (seekTime: number) => {
  seekYTPlayer(seekTime);
  setActiveSkipKey(null);
};

const getSkipSeekTimeWithEnd = (nextLine: BuiltMapLine) => {
  const map = getBuiltMap();
  if (!map) throw new Error("not found map");
  if (nextLine.lyrics !== "end") throw new Error("not end line");

  const { timeOffset } = getUtilityRefParams();
  const userOptions = readTypingOptions();
  const playSpeed = readMediaSpeed();

  const skippedTime = nextLine.time + userOptions.timeOffset + timeOffset;

  return skippedTime - 2 + 2 - playSpeed;
};

const getSeekTimeWithLineIndex = (lineIndex: number) => {
  const map = getBuiltMap();
  const line = map?.lines[lineIndex];
  if (!line) throw new Error("not found line");
  const { timeOffset } = getUtilityRefParams();
  const userOptions = readTypingOptions();
  const playSpeed = readMediaSpeed();

  const skippedTime = line.time + userOptions.timeOffset + timeOffset;

  return skippedTime - 1 + 1 - playSpeed;
};
