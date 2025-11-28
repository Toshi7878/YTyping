"use client";
import { setTypingOptions, useTypingOptionsState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { useSceneState } from "@/app/(typing)/type/_lib/atoms/state";
import { CheckboxCardGroup } from "@/components/ui/checkbox/checkbox";
import { DEFAULT_TYPING_OPTIONS } from "@/server/drizzle/const";

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
