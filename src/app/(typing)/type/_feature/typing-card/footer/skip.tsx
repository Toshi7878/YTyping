import { useActiveSkipGuideKeyState } from "../../../_atoms/state";

export const SkipGuideText = () => {
  const activeSkipGuideKey = useActiveSkipGuideKeyState();
  return (
    <div className="opacity-60" id="skip_guide">
      {activeSkipGuideKey ? `Type ${activeSkipGuideKey} key to Skip. ⏩` : ""}
    </div>
  );
};
