import { atom } from "jotai/vanilla";
import { uncontrolled } from "jotai-uncontrolled";
import { getTypeAtomStore } from "../../../_atoms/store";

const totalProgressValueAtom = atom(0);
const totalProgressMaxAtom = atom(0);
const store = getTypeAtomStore();

export const getTotalProgressMax = () => store.get(totalProgressMaxAtom);
export const setTotalProgressValue = (value: number) => store.set(totalProgressValueAtom, value);
export const setTotalProgressMax = (max: number) => store.set(totalProgressMaxAtom, max);

interface TotalTimeProgressProps {
  id: string;
}
export const TotalTimeProgress = (props: TotalTimeProgressProps) => {
  return (
    <uncontrolled.progress
      id={props.id}
      value={totalProgressValueAtom}
      max={totalProgressMaxAtom}
      atomStore={store}
      className={
        "h-[16px] w-full max-sm:my-2 md:h-[10px] [&::-moz-progress-bar]:rounded-lg [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-primary"
      }
    />
  );
};
