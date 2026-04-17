import { atom } from "jotai/vanilla";
import { uncontrolled } from "jotai-uncontrolled";
import type { BuiltMapLine } from "lyrics-typing-engine";
import { getBuiltMap } from "../../atoms/built-map";
import { store } from "../../atoms/store";
import { seekYTPlayer } from "../../atoms/youtube-player";
import { getTypingOptions } from "../../tabs/setting/popover";
import { getMediaSpeed } from "../../youtube/youtube-player";
import { getTimeOffset } from "../playing/playing-scene";

type SkipKey = "Space" | null;

const skipKeyAtom = atom<SkipKey>(null);
const skipGuideMessageAtom = atom<string>((get) => {
  const activeSkipGuideKey = get(skipKeyAtom);
  return activeSkipGuideKey ? `Type ${activeSkipGuideKey} key to Skip. ⏩` : "";
});

export const getActiveSkipKey = () => store.get(skipKeyAtom);
export const setActiveSkipKey = (value: SkipKey) => store.set(skipKeyAtom, value);
export const resetSkipKeyAtom = () => store.set(skipKeyAtom, null);

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

  const timeOffset = getTimeOffset();
  const typingOptions = getTypingOptions();
  const playSpeed = getMediaSpeed();

  const skippedTime = nextLine.time + typingOptions.timeOffset + timeOffset;

  return skippedTime - 2 + 2 - playSpeed;
};

const getSeekTimeWithLineIndex = (lineIndex: number) => {
  const map = getBuiltMap();
  const line = map?.lines[lineIndex];
  if (!line) throw new Error("not found line");
  const timeOffset = getTimeOffset();
  const typingOptions = getTypingOptions();
  const playSpeed = getMediaSpeed();

  const skippedTime = line.time + typingOptions.timeOffset + timeOffset;

  return skippedTime - 1 + 1 - playSpeed;
};
