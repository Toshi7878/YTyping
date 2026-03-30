import { lineKpmFormatAtom, lineRemainFormatTimeAtom } from "../../../_lib/atoms/sub-status";
import { useStore } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";

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
  const store = useStore();

  return (
    <uncontrolled.span id="line_kpm" atomStore={store}>
      {lineKpmFormatAtom}
    </uncontrolled.span>
  );
};

const LineRemainTime = ({ className }: { className: string }) => {
  const store = useStore();

  return (
    <uncontrolled.span id="line_remain_time" className={className} atomStore={store}>
      {lineRemainFormatTimeAtom}
    </uncontrolled.span>
  );
};
