"use client";
import { useTranslations } from "next-intl";
import { MdRestartAlt } from "react-icons/md";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { Button } from "@/ui/button";
import { CounterInput } from "@/ui/counter";
import { H4 } from "@/ui/typography";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const WindowDisplayField = () => {
  const t = useTranslations("typing.settings");
  const { windowScaleWidth } = useTypingOptionsState();

  const resetToDefaults = () => {
    setTypingOptions({ windowScaleWidth: DEFAULT_TYPING_OPTIONS.windowScaleWidth });
  };

  return (
    <section className="flex flex-col gap-4">
      <H4>{t("windowTitle")}</H4>

      <div className="flex items-center gap-6">
        <CounterInput
          onChange={(value) => setTypingOptions({ windowScaleWidth: value })}
          step={10}
          max={1400}
          min={1000}
          valueDigits={0}
          value={windowScaleWidth}
          label={t("windowWidth")}
          incrementTooltip={t("windowWider")}
          decrementTooltip={t("windowNarrower")}
          size="lg"
          unit="px"
        />
        <Button size="sm" variant="outline" onClick={resetToDefaults}>
          <MdRestartAlt className="mr-2" />
          {t("reset")}
        </Button>
      </div>
    </section>
  );
};
