"use client";
import type { InputMode } from "lyrics-typing-engine";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { setReadyInputMode, useReadyInputModeState } from "@/lib/atoms/global-atoms";
import { cn } from "@/lib/utils";

export const ReadyInputModeRadioCards = () => {
  const options: { value: InputMode; label: string }[] = [
    { value: "roma", label: "ローマ字入力" },
    { value: "kana", label: "かな入力" },
    { value: "flick", label: "フリック入力" },
  ];

  const readyInputMode = useReadyInputModeState();

  const handleChange = (value: InputMode) => {
    setReadyInputMode(value);
  };

  return (
    <RadioGroup value={readyInputMode} onValueChange={handleChange} className="flex w-full gap-0">
      {options.map((option) => {
        return (
          <RadioCard
            key={option.value}
            value={option.value}
            disabled={option.value === "flick"}
            className={cn(
              "flex-1 cursor-pointer select-none rounded border border-border py-16 font-bold text-4xl shadow-md transition-none md:py-10 md:text-3xl",
              option.value === "roma" && readyInputMode !== option.value && "hover:bg-roma/50",
              option.value === "kana" && readyInputMode !== option.value && "hover:bg-kana/50",
              option.value === "flick" && readyInputMode !== option.value && "hover:bg-flick/50",
              option.value === "roma" && readyInputMode === option.value && "bg-roma",
              option.value === "kana" && readyInputMode === option.value && "bg-kana",
              option.value === "flick" && readyInputMode === option.value && "bg-flick",
            )}
          >
            {option.label}
          </RadioCard>
        );
      })}
    </RadioGroup>
  );
};
