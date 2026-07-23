import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { store } from "./provider";

const ruleTextAtom = atomWithReset("");

export const setRuleText = (text: string) => store.set(ruleTextAtom, text);
export const resetRuleText = () => store.set(ruleTextAtom, RESET);

export const RuleDisplay = () => {
  const ruleText = useAtomValue(ruleTextAtom);

  if (!ruleText) return null;

  return (
    <div
      className="pointer-events-none fixed top-10 right-0 z-10 max-w-[40%] break-words px-2 text-right font-bold text-xl"
      style={{
        fontFamily: "Yu Gothic Ui",
        textShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
      }}
    >
      {ruleText}
    </div>
  );
};
