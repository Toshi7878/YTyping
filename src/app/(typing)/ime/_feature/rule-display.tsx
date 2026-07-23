import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { store } from "./provider";

const ruleTextAtom = atomWithReset("");

export const setRuleText = (text: string) => store.set(ruleTextAtom, text);
export const resetRuleText = () => store.set(ruleTextAtom, RESET);

interface RuleOptions {
  insertEnglishSpaces: boolean;
  isCaseSensitive: boolean;
  enableIncludeRegex: boolean;
}

export const buildRuleText = ({ insertEnglishSpaces, isCaseSensitive, enableIncludeRegex }: RuleOptions) => {
  const rules: string[] = [];
  if (insertEnglishSpaces) rules.push("英語スペースあり");
  if (isCaseSensitive) rules.push("英語大文字あり");
  if (enableIncludeRegex) rules.push("記号入力あり");
  return rules.join(" / ");
};

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
