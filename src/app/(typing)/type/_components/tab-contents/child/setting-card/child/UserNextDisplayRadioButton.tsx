import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { $Enums } from "@prisma/client";

const UserNextDisplayRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { next_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.next_display) => {
    setUserTypingOptions({ next_display: value });
  };

  return (
    <div>
      <label className="mb-2 block text-lg font-semibold">次の歌詞表示</label>
      <RadioGroup value={next_display} onValueChange={changeRadio}>
        <div className="flex flex-row gap-5">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="LYRICS" id="lyrics" />
            <Label htmlFor="lyrics">歌詞</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="WORD" id="word" />
            <Label htmlFor="word">ワード</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserNextDisplayRadioButton;
