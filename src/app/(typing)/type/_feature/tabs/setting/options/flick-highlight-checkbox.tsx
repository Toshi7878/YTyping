"use client";
import { useTranslations } from "next-intl";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { CheckboxCardGroup } from "@/ui/checkbox/checkbox";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const FlickHighlightCheckbox = () => {
  const t = useTranslations("typing.settings");
  const { isFlickNextKeyHighlight } = useTypingOptionsState();

  const items = [
    {
      label: t("flickHighlight"),
      checked: isFlickNextKeyHighlight,
      onCheckedChange: (checked: boolean) => setTypingOptions({ isFlickNextKeyHighlight: checked }),
      defaultChecked: DEFAULT_TYPING_OPTIONS.isFlickNextKeyHighlight,
    },
  ];
  return <CheckboxCardGroup items={items} />;
};
