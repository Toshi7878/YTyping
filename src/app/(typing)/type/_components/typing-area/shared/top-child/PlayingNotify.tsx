import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/refAtoms";
import { useNotifyState, useSceneState, useSetNotify } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { AnimatePresence, motion } from "framer-motion"; // 追加
import { useEffect, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";

const NON_ANIMATED = ["ll", "Replay", "Practice"];

const PlayingNotify = () => {
  const notify = useNotifyState();
  const setNotify = useSetNotify();
  const scene = useSceneState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();

  const playModeNotify = () => {
    if (scene === "play") {
      setNotify(Symbol(""));
    } else if (scene === "replay") {
      setNotify(Symbol(`Replay`));
    } else if (scene === "practice") {
      setNotify(Symbol("Practice"));
    }
  };

  useEffect(() => {
    if (!NON_ANIMATED.includes(notify.description || "")) {
      timerRef.current = setTimeout(() => {
        handleExitComplete();
      }, 800);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [notify.description]);

  const handleExitComplete = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!NON_ANIMATED.includes(notify.description || "")) {
      playModeNotify();
    }
  };

  useEffect(() => {
    if (scene !== "play") {
      playModeNotify();
    }
  }, [scene]);

  return (
    <div className="absolute left-[41%] text-center whitespace-nowrap select-none" id="playing_notify">
      {NON_ANIMATED.includes(notify.description || "") ? (
        <div className={notify.description === "Replay" || notify.description === "Practice" ? "opacity-30" : ""}>
          {notify.description === "ll" ? (
            <FaPause />
          ) : notify.description === "Replay" ? (
            `${readGameUtilRefParams().replayUserName} Replay`
          ) : (
            notify.description
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout" key={Date.now()}>
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
          >
            <div>{notify.description === "▶" ? <FaPlay /> : notify.description}</div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default PlayingNotify;
