import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useNotifyState, useSceneState, useSetNotifyState } from "@/app/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion"; // 追加
import { useEffect, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";

interface PlayingNotifyProps {
  className?: string;
}

const NON_ANIMATED = ["ll", "Replay", "Practice"];

const PlayingNotify = ({ className = "" }: PlayingNotifyProps) => {
  const notify = useNotifyState();
  const setNotify = useSetNotifyState();
  const scene = useSceneState();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { readGameUtils } = useGameUtilsRef();

  const playModeNotify = () => {
    if (scene === "playing") {
      setNotify(Symbol(""));
    } else if (scene === "replay") {
      setNotify(Symbol(`Replay`));
    } else if (scene === "practice") {
      setNotify(Symbol("Practice"));
    }
  };

  useEffect(() => {
    if (notify.description && !NON_ANIMATED.includes(notify.description)) {
      // 1秒後にhandleExitCompleteを強制的に実行
      timerRef.current = setTimeout(() => {
        handleExitComplete();
      }, 800);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify.description]);

  const handleExitComplete = () => {
    // exitアニメーション完了時の処理をここに記述
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!NON_ANIMATED.includes(notify.description!)) {
      playModeNotify();
    }
  };

  useEffect(() => {
    if (scene !== "playing") {
      playModeNotify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);
  return (
    <Box
      position="absolute"
      left="41%"
      whiteSpace="nowrap"
      textAlign="center"
      className={`${className}`}
      userSelect="none"
      id="playing_notify"
    >
      {notify.description && NON_ANIMATED.includes(notify.description) ? (
        <Box
          className={`${className} ${
            notify.description === "Replay" || notify.description === "Practice" ? "opacity-30" : ""
          }`}
        >
          {notify.description === "ll" ? (
            <FaPause />
          ) : notify.description === "Replay" ? (
            `${readGameUtils().replayUserName} Replay`
          ) : (
            notify.description
          )}
        </Box>
      ) : (
        <AnimatePresence mode="popLayout" onExitComplete={handleExitComplete}>
          {notify.description && (
            <motion.div
              key={Date.now()}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <Box>{notify.description === "▶" ? <FaPlay /> : notify.description}</Box>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Box>
  );
};

export default PlayingNotify;
