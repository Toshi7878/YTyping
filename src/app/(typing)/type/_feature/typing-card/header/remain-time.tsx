import { atom } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { cn } from "@/lib/utils";
import { store } from "../../atoms/store";

const lineRemainTimeAtom = atom(0);

const lineRemainFormatTimeAtom = atom((get) => {
  const lineRemainTime = get(lineRemainTimeAtom);
  return lineRemainTime.toFixed(1);
});

export const getLineRemainTime = () => store.get(lineRemainTimeAtom);
export const setLineRemainTime = (value: number) => store.set(lineRemainTimeAtom, value);

export const LineRemainTime = ({ className }: { className: string }) => {
  return (
    <uncontrolled.span id="line_remain_time" className={cn("tabular-nums", className)} atomStore={store}>
      {lineRemainFormatTimeAtom}
    </uncontrolled.span>
  );
};
