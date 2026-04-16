"use client";
import { CheckboxCardGroup } from "@/components/ui/checkbox/checkbox";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";
import { useSceneState } from "../../../typing-card/typing-card";
import { setTypingOptions, useTypingOptionsState } from "../popover";

export const CaseSensitiveCheckbox = () => {
  const { isCaseSensitive } = useTypingOptionsState();
  const scene = useSceneState();

  const items = [
    {
      label: "アルファベット大文字の入力判定を有効化",
      checked: isCaseSensitive,
      onCheckedChange: (checked: boolean) => setTypingOptions({ isCaseSensitive: checked }),
      defaultChecked: DEFAULT_TYPING_OPTIONS.isCaseSensitive,
      disabled: scene !== "ready",
      tooltip: "開始前のみ設定を変更できます",
    },
  ];
  return <CheckboxCardGroup items={items} />;
};
