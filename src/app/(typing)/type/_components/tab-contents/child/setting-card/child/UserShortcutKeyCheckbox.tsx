import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { $Enums } from "@prisma/client";

const UserShortcutKeyCheckbox = () => {
  const { time_offset_key, toggle_input_mode_key } = useUserTypingOptionsState();
  const { setUserTypingOptions } = useSetUserTypingOptionsState();

  const changeTimeOffsetKey = (value: string) => {
    setUserTypingOptions({ time_offset_key: value as $Enums.time_offset_key });
  };

  const changeInputModeKey = (value: string) => {
    setUserTypingOptions({ toggle_input_mode_key: value as $Enums.toggle_input_mode_key });
  };

  return (
    <div className="flex">
      <div>
        <label className="text-lg font-semibold mb-2 block">
          ショートカットキー設定
        </label>
        <div className="flex items-baseline mb-4 gap-2">
          <span className="mr-2">タイミング調整</span>
          <Select value={time_offset_key} onValueChange={changeTimeOffsetKey}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CTRL_LEFT_RIGHT">Ctrl+←→</SelectItem>
              <SelectItem value="CTRL_ALT_LEFT_RIGHT">Ctrl+Alt+←→</SelectItem>
              <SelectItem value="NONE">無効化</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="mr-2">かな⇔ローマ字切り替え</span>
          <Select value={toggle_input_mode_key} onValueChange={changeInputModeKey}>
            <SelectTrigger className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALT_KANA">Alt+Kana</SelectItem>
              <SelectItem value="TAB">Tab</SelectItem>
              <SelectItem value="NONE">無効化</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default UserShortcutKeyCheckbox;
