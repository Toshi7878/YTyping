import { AnimatePresence, motion } from "framer-motion"; // 追加
import { useEffect, useMemo, useRef } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";
import {
  setNotify,
  useNotifyState,
  useReplayRankingResultState,
  useSceneState,
} from "@/app/(typing)/type/_lib/atoms/state";
import { cn } from "@/lib/utils";

const NON_ANIMATED = ["ll", "Replay", "Practice"];

export const PlayingNotify = () => {
  const notify = useNotifyState();
  const scene = useSceneState();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyKey = useMemo(() => Math.random().toString(), [notify]);

  const playModeNotify = () => {
    if (scene === "play") {
      setNotify(Symbol(""));
    } else if (scene === "replay") {
      setNotify(Symbol("Replay"));
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
  }, [notify]);

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
      className="pointer-events-none absolute -translate-x-1/2 select-none whitespace-nowrap"
      style={{ left: `calc(45% - ${offsetCh}ch)` }}
      id="playing_notify"
    >
      {NON_ANIMATED.includes(notify.description || "") ? (
        <div className={cn(notify.description === "Replay" || notify.description === "Practice" ? "opacity-30" : "")}>
          <NonAnimatedNotifyText description={notify.description ?? ""} />
        </div>
      ) : (
        <TransitionNotify description={notify.description ?? ""} notifyKey={notifyKey} />
      )}
    </div>
  );
};

const NonAnimatedNotifyText = ({ description }: { description: string }) => {
  const replayUserRankingResult = useReplayRankingResultState();

  switch (description) {
    case "ll":
      return <FaPause />;
    case "Replay":
      return `${replayUserRankingResult?.player.name ?? "Unknown"} Replay`;
    case "Practice":
      return "Practice";
  }
};

const TransitionNotify = ({ description, notifyKey }: { description: string; notifyKey: string }) => {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={notifyKey}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0 }}
      >
        <div>{description === "▶" ? <FaPlay /> : description}</div>
      </motion.div>
    </AnimatePresence>
  );
};
