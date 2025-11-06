import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { LabeledSelect } from "@/components/ui/select/labeled-select";
import { H4 } from "@/components/ui/typography";
import type { InputModeToggleKeyEnum, timeOffsetAdjustKeyEnum } from "@/server/drizzle/schema";

export const HotKeySelectFields = () => {
  const { timeOffsetAdjustKey, InputModeToggleKey } = useTypingOptionsState();

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
            setTypingOptions({ timeOffsetAdjustKey: value as (typeof timeOffsetAdjustKeyEnum.enumValues)[number] });
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
          value={InputModeToggleKey}
          onValueChange={(value: string) => {
            setTypingOptions({ InputModeToggleKey: value as (typeof InputModeToggleKeyEnum.enumValues)[number] });
          }}
        />
      </div>
    </section>
  );
};
