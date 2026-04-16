import { atom } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { store } from "../../atoms/store";

const lineProgressValueAtom = atom(0);
const lineProgressMaxAtom = atom(0);

export const getLineProgressMax = () => store.get(lineProgressMaxAtom);
export const setLineProgressValue = (value: number) => store.set(lineProgressValueAtom, value);
export const setLineProgressMax = (max: number) => store.set(lineProgressMaxAtom, max);

interface LineTimeProgressProps {
  id: string;
}
export const LineTimeProgress = (props: LineTimeProgressProps) => {
  return (
    <uncontrolled.progress
      id={props.id}
      value={lineProgressValueAtom}
      max={lineProgressMaxAtom}
      atomStore={store}
      className={
        "h-[16px] w-full max-sm:my-2 md:h-[10px] [&::-moz-progress-bar]:rounded-lg [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-primary"
      }
    />
  );
};
