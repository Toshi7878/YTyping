import type { INPUT_MODE_KEY_TYPES, TIME_OFFSET_KEY_TYPES } from "@/server/drizzle/schema";
import { LabeledSelect } from "@/ui/select/labeled-select";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const HotKeySelectFields = () => {
  const { timeOffsetAdjustKey, inputModeToggleKey } = useTypingOptionsState();

  return (
    <section className="flex flex-col gap-2">
      <H4>ショートカットキー設定</H4>
      <div className="flex items-baseline">
        <LabeledSelect
          label="タイミング調整"
          options={[
            { label: "Ctrl+←→", value: "CTRL_LEFT_RIGHT" },
            { label: "Ctrl+Alt+←→", value: "CTRL_ALT_LEFT_RIGHT" },
            { label: "無効化", value: "NONE" },
          ]}
          value={timeOffsetAdjustKey}
          onValueChange={(value) => {
            setTypingOptions({ timeOffsetAdjustKey: value as (typeof TIME_OFFSET_KEY_TYPES)[number] });
          }}
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
          value={inputModeToggleKey}
          onValueChange={(value: string) => {
            setTypingOptions({ inputModeToggleKey: value as (typeof INPUT_MODE_KEY_TYPES)[number] });
          }}
        />
      </div>
    </section>
  );
};
