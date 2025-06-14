"use client";
import { useSetPlayingInputMode } from "@/app/(typing)/type/atoms/stateAtoms";
import { useReadyInputModeState, useSetReadyInputMode } from "@/app/(typing)/type/atoms/storageAtoms";
import { InputMode } from "@/app/(typing)/type/ts/type";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

interface RadioCardProps {
  option: InputMode;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}
function RadioCard({ option, value, disabled, children }: RadioCardProps) {
  const romaBg = "#e53e3e";
  const kanaBg = "#3182ce";
  const flickBg = "#805ad5";
  const selectedBg = option === "roma" ? romaBg : option === "kana" ? kanaBg : flickBg;

  return (
    <Label
      htmlFor={value}
      className={`flex-1 cursor-pointer border border-border rounded shadow-md font-bold select-none transition-colors
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        hover:opacity-80
        px-[60px] py-[2.6rem] text-[2.75rem] md:text-3xl text-center`}
      style={{
        backgroundColor: selectedBg + "40",
      }}
    >
      <RadioGroupItem
        id={value}
        value={value}
        disabled={disabled}
        className="sr-only"
      />
      {children}
    </Label>
  );
}

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
    <RadioGroup
      value={readyInputMode}
      onValueChange={handleChange}
      className="flex w-full gap-0"
    >
      {options.map((option) => {
        return (
          <RadioCard
            key={option.value}
            option={option.value}
            value={option.value}
            disabled={option.value === "flick"}
          >
            {option.label}
          </RadioCard>
        );
      })}
    </RadioGroup>
  );
}

export default ReadyInputModeRadioCards;
