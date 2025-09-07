import { getBaseUrl } from "@/utils/getBaseUrl";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useUserStats } from "../../atoms/refAtoms";
import { useMapState, useSceneGroupState, useSceneState } from "../../atoms/stateAtoms";

const useSendUserTypingStats = () => {
  const { data: session } = useSession();
  const { readUserStats, resetUserStats } = useUserStats();
  const scene = useSceneState();
  const map = useMapState();
  const sceneGroup = useSceneGroupState();

  useEffect(() => {
    if (sceneGroup !== "Playing" || !map) return;

    const handleVisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        const sendStats = readUserStats();
        const maxCombo = sendStats.maxCombo;
        navigator.sendBeacon(
          `${getBaseUrl()}/api/update-user-typing-stats`,
          JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) }),
        );

        resetUserStats(structuredClone(maxCombo));
      }
    };
    const handleBeforeunload = () => {
      const sendStats = readUserStats();
      const maxCombo = sendStats.maxCombo;
      navigator.sendBeacon(
        `${getBaseUrl()}/api/update-user-typing-stats`,
        JSON.stringify({ ...sendStats, userId: Number(session?.user.id ?? 0) }),
      );
      resetUserStats(structuredClone(maxCombo));
    };

    if (scene === "play" || scene === "practice") {
      window.addEventListener("beforeunload", handleBeforeunload);
      window.addEventListener("visibilitychange", handleVisibilitychange);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      window.removeEventListener("visibilitychange", handleVisibilitychange);
    };
  }, [scene, map, sceneGroup]);
};

export default useSendUserTypingStats;
