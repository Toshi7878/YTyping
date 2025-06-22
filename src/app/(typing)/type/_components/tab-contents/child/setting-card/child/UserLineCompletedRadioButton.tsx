import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { $Enums } from "@prisma/client";

const UserLineCompletedRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { line_completed_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.line_completed_display) => {
    setUserTypingOptions({ line_completed_display: value });
  };

  return (
    <div>
      <label className="mb-2 block font-semibold">打ち切り時のワード表示</label>
      <RadioGroup value={line_completed_display} onValueChange={changeRadio}>
        <div className="flex flex-row gap-5">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="HIGH_LIGHT" id="highlight" />
            <Label htmlFor="highlight">ワードハイライト</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NEXT_WORD" id="nextword" />
            <Label htmlFor="nextword">次のワードを表示</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserLineCompletedRadioButton;
