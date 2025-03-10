import { useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { YouTubeEvent } from "@/types/global-types";
import { useDispatch, useStore as useReduxStore } from "react-redux";
import { editTicker } from "../_components/editor-youtube-content/EditYoutube";
import {
  useSetIsEditYTPlayingAtom,
  useSetIsEditYTReadyAtom,
  useSetIsEditYTStartedAtom,
  useSetTabIndexAtom,
} from "../edit-atom/editAtom";
import { useRefs } from "../edit-contexts/refsProvider";
import { updateLine } from "../redux/mapDataSlice";
import { RootState } from "../redux/store";
import { useGetSeekCount } from "./useGetSeekCount";
import { useUpdateCurrentTimeLine } from "./useUpdateCurrentTimeLine";

export const useYTReadyEvent = () => {
  const { setRef } = useRefs();
  const setIsReady = useSetIsEditYTReadyAtom();
  const dispatch = useDispatch();
  const volume = useVolumeAtom();
  const editReduxStore = useReduxStore<RootState>();

  return (event) => {
    const player = event.target;
    setRef("playerRef", player);
    const duration = player.getDuration();
    player.setVolume(volume);
    setIsReady(true);

    const mapData = editReduxStore.getState().mapData.value;
    if (mapData.length === 2) {
      dispatch(
        updateLine({
          time: duration.toFixed(3),
          lyrics: "end",
          word: "",
          selectedLineCount: 1,
        })
      );
    }
  };
};

export const useYTPlayEvent = () => {
  const { editStatus } = useRefs();
  const setIsYTPlaying = useSetIsEditYTPlayingAtom();
  const setIsYTStarted = useSetIsEditYTStartedAtom();
  const setTabIndex = useSetTabIndexAtom();

  const onPlay = () => {
    console.log("再生 1");

    editTicker.start();
    setIsYTPlaying(true);
    setIsYTStarted(true);
    if (!editStatus.current?.isNotAutoTabToggle) {
      setTabIndex(1);
    }

    editStatus.current!.isNotAutoTabToggle = false;
  };

  return onPlay;
};

export const useYTPauseEvent = () => {
  const setIsYTPlaying = useSetIsEditYTPlayingAtom();

  return () => {
    console.log("一時停止");
    editTicker.stop();
    setIsYTPlaying(false);
  };
};

export const useYTEndStopEvent = () => {
  const setIsYTPlaying = useSetIsEditYTPlayingAtom();

  return () => {
    console.log("プレイ終了 動画完全停止");
    editTicker.stop();
    setIsYTPlaying(false);
  };
};

export const useYTSeekEvent = () => {
  const getSeekCount = useGetSeekCount();
  const updateCurrentLine = useUpdateCurrentTimeLine();

  return (event: YouTubeEvent) => {
    const time = event.target.getCurrentTime();
    console.log(`シークtime: ${time}`);
    updateCurrentLine(getSeekCount(time));
  };
};
