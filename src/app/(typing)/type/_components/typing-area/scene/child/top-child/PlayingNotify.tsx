import { useGameUtilityReferenceParams } from "@/app/(typing)/type/atoms/refAtoms";
import { useNotifyState, useSceneState, useSetNotify } from "@/app/(typing)/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <Box position="absolute" left="41%" whiteSpace="nowrap" textAlign="center" userSelect="none" id="playing_notify">
      {NON_ANIMATED.includes(notify.description || "") ? (
        <Box className={notify.description === "Replay" || notify.description === "Practice" ? "opacity-30" : ""}>
          {notify.description === "ll" ? (
            <FaPause />
          ) : notify.description === "Replay" ? (
            `${readGameUtilRefParams().replayUserName} Replay`
          ) : (
            notify.description
          )}
        </Box>
      ) : (
        <AnimatePresence mode="popLayout" key={Date.now()}>
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            exit={{ opacity: 0 }}
          >
            <Box>{notify.description === "▶" ? <FaPlay /> : notify.description}</Box>
          </motion.div>
        </AnimatePresence>
      )}
    </Box>
  );
};

export default PlayingNotify;
