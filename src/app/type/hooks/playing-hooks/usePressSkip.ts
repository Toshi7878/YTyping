import { useStore } from "jotai";
import { CreateMap } from "../../../../lib/instanceMapData";
import {
  gameStateRefAtom,
  typingStatusRefAtom,
  usePlayer,
  ytStateRefAtom,
} from "../../atoms/refAtoms";
import {
  speedAtom,
  timeOffsetAtom,
  useMapAtom,
  userTypingOptionsAtom,
  useSetSkipAtom,
} from "../../atoms/stateAtoms";

export const usePressSkip = () => {
  const player = usePlayer();
  const map = useMapAtom() as CreateMap;
  const typeAtomStore = useStore();
  const setSkip = useSetSkipAtom();

  return () => {
    const userOptions = typeAtomStore.get(userTypingOptionsAtom);
    const timeOffset = typeAtomStore.get(timeOffsetAtom);
    const count = typeAtomStore.get(typingStatusRefAtom).count;

    const nextLine = map!.mapData[count];
    const isRetrySkip = typeAtomStore.get(gameStateRefAtom).isRetrySkip;

    const skippedTime =
      (isRetrySkip ? Number(map!.mapData[map!.startLine]["time"]) : Number(nextLine["time"])) +
      userOptions.time_offset +
      timeOffset;

    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const movieDuration = typeAtomStore.get(ytStateRefAtom).movieDuration;
    const seekTime =
      nextLine["lyrics"] === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    player.seekTo(seekTime, true);

    typeAtomStore.set(gameStateRefAtom, (prev) => ({ ...prev, isRetrySkip: false }));
    setSkip("");
  };
};
