import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H5 } from "@/components/ui/typography";
import { $Enums } from "@prisma/client";

const UserShortcutKeyCheckbox = () => {
  const { time_offset_key, toggle_input_mode_key } = useUserTypingOptionsState();
  const { setUserTypingOptions } = useSetUserTypingOptions();

  const changeTimeOffsetKey = (value: string) => {
    setUserTypingOptions({ time_offset_key: value as $Enums.time_offset_key });
  };

  const changeInputModeKey = (value: string) => {
    setUserTypingOptions({ toggle_input_mode_key: value as $Enums.toggle_input_mode_key });
  };

  return (
    <section className="flex flex-col gap-2">
      <H5>ショートカットキー設定</H5>
      <div className="flex items-baseline">
        <LabeledSelect
          label="タイミング調整"
          options={[
            { label: "Ctrl+←→", value: "CTRL_LEFT_RIGHT" },
            { label: "Ctrl+Alt+←→", value: "CTRL_ALT_LEFT_RIGHT" },
            { label: "無効化", value: "NONE" },
          ]}
          value={time_offset_key}
          onValueChange={changeTimeOffsetKey}
        />
      </div>
      <div className="flex items-baseline gap-2">
        <LabeledSelect
          label="かな⇔ローマ字切り替え"
          options={[
            { label: "Alt+Kana", value: "ALT_KANA" },
            { label: "Tab", value: "TAB" },
            { label: "無効化", value: "NONE" },
          ]}
          value={toggle_input_mode_key}
          onValueChange={changeInputModeKey}
        />
      </div>
    </section>
  );
};

export default UserShortcutKeyCheckbox;
