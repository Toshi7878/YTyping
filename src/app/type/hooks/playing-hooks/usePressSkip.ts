import { useStore } from "jotai";
import { CreateMap } from "../../ts/scene-ts/ready/createTypingWord";
import {
  speedAtom,
  timeOffsetAtom,
  useMapAtom,
  userOptionsAtom,
  useSetSkipAtom,
} from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";

export const usePressSkip = () => {
  const { statusRef, gameStateRef, ytStateRef, playerRef } = useRefs();
  const map = useMapAtom() as CreateMap;
  const typeAtomStore = useStore();
  const setSkip = useSetSkipAtom();

  return () => {
    const userOptions = typeAtomStore.get(userOptionsAtom);
    const timeOffset = typeAtomStore.get(timeOffsetAtom);

    const nextLine = map!.mapData[statusRef.current!.status.count];

    const skippedTime =
      (gameStateRef.current!.isRetrySkip
        ? Number(map!.mapData[map!.startLine]["time"])
        : Number(nextLine["time"])) +
      userOptions.timeOffset +
      timeOffset;

    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const seekTime =
      nextLine["lyrics"] === "end"
        ? ytStateRef.current!.movieDuration - 2
        : skippedTime - 1 + (1 - playSpeed);

    playerRef.current.seekTo(seekTime);
    gameStateRef.current!.isRetrySkip = false;
    setSkip("");
  };
};
