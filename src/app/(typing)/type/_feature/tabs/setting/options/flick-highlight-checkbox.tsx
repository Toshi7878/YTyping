"use client";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/schema";
import { CheckboxCardGroup } from "@/ui/checkbox/checkbox";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const FlickHighlightCheckbox = () => {
  const { isFlickNextKeyHighlight } = useTypingOptionsState();

  const items = [
    {
      label: "フリック入力時に次の文字のキーを強調表示",
      checked: isFlickNextKeyHighlight,
      onCheckedChange: (checked: boolean) => setTypingOptions({ isFlickNextKeyHighlight: checked }),
      defaultChecked: DEFAULT_TYPING_OPTIONS.isFlickNextKeyHighlight,
    },
  ];
  return <CheckboxCardGroup items={items} />;
};
