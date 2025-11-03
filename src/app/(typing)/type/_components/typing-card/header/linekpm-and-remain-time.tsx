import { useLineKpmState, useLineRemainTimeState } from "../../../_lib/atoms/state";

export const LineRemainTimeAndKpm = () => {
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
