import { useStore } from "jotai";
import { CreateMap } from "../../../../lib/instanceMapData";
import { useGameRef, usePlayer, useStatusRef, useYTStatusRef } from "../../atoms/refAtoms";
import {
  speedAtom,
  timeOffsetAtom,
  useMapAtom,
  userTypingOptionsAtom,
  useSetSkipAtom,
} from "../../atoms/stateAtoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const map = useMapAtom() as CreateMap;
  const typeAtomStore = useStore();
  const setSkip = useSetSkipAtom();

  const { readGameRef, writeGameRef } = useGameRef();
  const { readYTStatusRef } = useYTStatusRef();
  const { readStatusRef } = useStatusRef();

  return () => {
    const userOptions = typeAtomStore.get(userTypingOptionsAtom);
    const timeOffset = typeAtomStore.get(timeOffsetAtom);
    const count = readStatusRef().count;

    const nextLine = map!.mapData[count];
    const isRetrySkip = readGameRef().isRetrySkip;

    const skippedTime =
      (isRetrySkip ? Number(map!.mapData[map!.startLine]["time"]) : Number(nextLine["time"])) +
      userOptions.time_offset +
      timeOffset;

    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const movieDuration = readYTStatusRef().movieDuration;
    const seekTime =
      nextLine["lyrics"] === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameRef({ isRetrySkip: false });
    setSkip("");
  };
};
