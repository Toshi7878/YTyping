import { AnimatePresence, motion } from "framer-motion"; // 追加
import { useEffect, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";
import { useGameUtilityReferenceParams } from "@/app/(typing)/type/_lib/atoms/ref-atoms";
import { useNotifyState, useSceneState, useSetNotify } from "@/app/(typing)/type/_lib/atoms/state-atoms";

const NON_ANIMATED = ["ll", "Replay", "Practice"];

const PlayingNotify = () => {
  const notify = useNotifyState();
  const setNotify = useSetNotify();
  const scene = useSceneState();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const textForOffset = (notify.description ?? "").toString();
  const offsetCh = Math.max(0, textForOffset.length - 1) * -0.2; // 1文字あたり-0.2chだけ左へ

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap select-none"
      style={{ left: `calc(45% - ${offsetCh}ch)` }}
      id="playing_notify"
    >
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
