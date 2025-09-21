import { useSetUserTypingOptions, useUserTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H5 } from "@/components/ui/typography";
import type { InputModeToggleKeyEnum, timeOffsetAdjustKeyEnum } from "@/server/drizzle/schema";

const UserShortcutKeyCheckbox = () => {
  const { timeOffsetAdjustKey, InputModeToggleKey } = useUserTypingOptionsState();
  const { setUserTypingOptions } = useSetUserTypingOptions();

  const changeTimeOffsetAdjustKey = (value: string) => {
    setUserTypingOptions({ timeOffsetAdjustKey: value as (typeof timeOffsetAdjustKeyEnum.enumValues)[number] });
  };

  const changeInputModeKey = (value: string) => {
    setUserTypingOptions({ InputModeToggleKey: value as (typeof InputModeToggleKeyEnum.enumValues)[number] });
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
          value={timeOffsetAdjustKey}
          onValueChange={changeTimeOffsetAdjustKey}
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
          value={InputModeToggleKey}
          onValueChange={changeInputModeKey}
        />
      </div>
    </section>
  );
};

export default UserShortcutKeyCheckbox;
