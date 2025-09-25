import { useTRPC } from "@/trpc/provider";
import { useMutation } from "@tanstack/react-query";
import { RESET } from "jotai/utils";
import { useParams } from "next/navigation";
import { useInputTextarea, usePlayer } from "../atoms/read-atoms";
import {
  useInitWordResults,
  useReadScene,
  useReadStatus,
  useResetGameUtilParams,
  useSetMap,
  useSetNextDisplayLine,
  useSetNotifications,
  useSetScene,
  useSetStatus,
} from "../atoms/state-atoms";

export const useInitializePlayScene = () => {
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();
  const setScene = useSetScene();
  const initWordResults = useInitWordResults();

  const { readInputTextarea } = useInputTextarea();

  const resetGameUtils = useResetGameUtilParams();
  const readStatus = useReadStatus();
  const trpc = useTRPC();
  const incrementPlayCountStats = useMutation(trpc.userStats.incrementPlayCountStats.mutationOptions());

  const { id: mapId } = useParams<{ id: string }>();
  const readScene = useReadScene();

  return () => {
    if (readStatus().typeCount > 0 || readScene() === "ready") {
      incrementPlayCountStats.mutate({ mapId: Number(mapId) });
    }

    resetGameUtils();
    setNextDisplayLine([]);
    setStatus(RESET);
    initWordResults();

    setNotifications(RESET);
    readInputTextarea().focus();

    setScene("play");
  };
};

export const usePathChangeAtomReset = () => {
  const resetGameUtils = useResetGameUtilParams();
  const setScene = useSetScene();
  const setMap = useSetMap();
  const { writePlayer } = usePlayer();
  const setNextDisplayLine = useSetNextDisplayLine();
  const setStatus = useSetStatus();
  const setNotifications = useSetNotifications();

  return () => {
    resetGameUtils();
    writePlayer(null);
    setMap(RESET);
    setScene(RESET);
    setNextDisplayLine([]);
    setStatus(RESET);
    setNotifications(RESET);
  };
};
