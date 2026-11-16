"use client";
import { useTranslations } from "next-intl";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { CheckboxCardGroup } from "@/ui/checkbox/checkbox";
import { useSceneState } from "../../../typing-card/typing-card";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const CaseSensitiveCheckbox = () => {
  const t = useTranslations("typing.settings");
  const { isCaseSensitive } = useTypingOptionsState();
  const scene = useSceneState();

  const items = [
    {
      label: t("caseSensitive"),
      checked: isCaseSensitive,
      onCheckedChange: (checked: boolean) => setTypingOptions({ isCaseSensitive: checked }),
      defaultChecked: DEFAULT_TYPING_OPTIONS.isCaseSensitive,
      disabled: scene !== "ready",
      tooltip: t("beforeStartOnly"),
    },
  ];
  return <CheckboxCardGroup items={items} />;
};
