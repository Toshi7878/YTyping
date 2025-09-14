import {
  useComboState,
  useLineKpmState,
  useLineRemainTimeState,
  useSceneGroupState,
  useYTStartedState,
} from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { cn } from "@/lib/utils";
import PlayingNotify from "./PlayingNotify";

const GameStatusHeader = () => {
  const sceneGroup = useSceneGroupState();
  const isYTStarted = useYTStartedState();

  const isPlayed = isYTStarted && sceneGroup === "Playing";

  return (
    <section
      className={cn(
        "top-card-text relative mt-3 mr-2 mb-1 ml-1 flex items-center justify-between font-mono text-5xl font-bold md:text-3xl",
        !isPlayed && "invisible",
      )}
    >
      <Combo />
      <PlayingNotify />
      <LineRemainTimeAndKpm />
    </section>
  );
};

const Combo = () => {
  const combo = useComboState();

  return <div>{combo}</div>;
};

const LineRemainTimeAndKpm = () => {
  return (
    <div className="whitespace-nowrap">
      <LineKpm />
      <span className="ml-1 tracking-widest">kpm</span>
      <span className="mx-3">-</span>
      残り
      <LineRemainTime className="mr-1" />秒
    </div>
  );
};

const LineKpm = () => {
  const displayLineKpm = useLineKpmState();

  return <span>{displayLineKpm.toFixed(0)}</span>;
};

const LineRemainTime = ({ className }: { className: string }) => {
  const displayLineRemainTime = useLineRemainTimeState();
  return <span className={className}>{displayLineRemainTime.toFixed(1)}</span>;
};

export default GameStatusHeader;
