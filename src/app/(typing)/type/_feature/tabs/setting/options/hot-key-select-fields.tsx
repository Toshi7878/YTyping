import { useTranslations } from "next-intl";
import type { INPUT_MODE_KEY_TYPES, TIME_OFFSET_KEY_TYPES } from "@/server/drizzle/schema";
import { LabeledSelect } from "@/ui/select/labeled-select";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const HotKeySelectFields = () => {
  const t = useTranslations("typing.settings");
  const { timeOffsetAdjustKey, inputModeToggleKey } = useTypingOptionsState();

  return (
    <section className="flex flex-col gap-2">
      <H4>{t("hotkeyTitle")}</H4>
      <div className="flex items-baseline">
        <LabeledSelect
          label={t("timeAdjust")}
          options={[
            { label: "Ctrl+←→", value: "CTRL_LEFT_RIGHT" },
            { label: "Ctrl+Alt+←→", value: "CTRL_ALT_LEFT_RIGHT" },
            { label: t("disabled"), value: "NONE" },
          ]}
          value={timeOffsetAdjustKey}
          onValueChange={(value) => {
            setTypingOptions({ timeOffsetAdjustKey: value as (typeof TIME_OFFSET_KEY_TYPES)[number] });
          }}
        />
      </div>
      <div className="flex items-baseline gap-2">
        <LabeledSelect
          label={t("toggleKey")}
          options={[
            { label: "Alt+Kana", value: "ALT_KANA" },
            { label: "Tab", value: "TAB" },
            { label: t("disabled"), value: "NONE" },
          ]}
          value={inputModeToggleKey}
          onValueChange={(value) => {
            setTypingOptions({ inputModeToggleKey: value as (typeof INPUT_MODE_KEY_TYPES)[number] });
          }}
        />
      </div>
    </section>
  );
};
