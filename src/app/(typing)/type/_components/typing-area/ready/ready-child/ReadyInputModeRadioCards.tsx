"use client";
import { useSetPlayingInputMode } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { useReadyInputModeState, useSetReadyInputMode } from "@/app/(typing)/type/_lib/atoms/storageAtoms";
import { InputMode } from "@/app/(typing)/type/_lib/type";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { cn } from "@/lib/utils";

function ReadyInputModeRadioCards() {
  const options: { value: InputMode; label: string }[] = [
    { value: "roma", label: "ローマ字入力" },
    { value: "kana", label: "かな入力" },
    { value: "flick", label: "フリック入力" },
  ];

  const readyInputMode = useReadyInputModeState();
  const setReadyInputMode = useSetReadyInputMode();
  const setPlayingInputMode = useSetPlayingInputMode();

  const handleChange = (value: string) => {
    setReadyInputMode(value as InputMode);
    setPlayingInputMode(value as InputMode);
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
              "border-border flex-1 cursor-pointer rounded border py-16 text-4xl font-bold shadow-md transition-colors select-none md:py-10 md:text-3xl",
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
}

export default ReadyInputModeRadioCards;
