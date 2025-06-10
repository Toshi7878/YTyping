import { useSearchResultModeState, useSetSearchResultMode } from "@/app/timeline/atoms/atoms";
import useSearchKeydown from "@/app/timeline/hook/useSearchKeydown";
import { FilterMode } from "@/app/timeline/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import React from "react";

interface RadioCardProps {
  option: FilterMode;
  children: React.ReactNode;
  value: string;
  checked: boolean;
}

function RadioCard({ option, children, value, checked }: RadioCardProps) {
  const getCardStyles = (option: FilterMode, checked: boolean) => {
    const baseClasses = "cursor-pointer border border-border shadow-md text-xs px-2 py-1 select-none transition-colors";

    if (checked) {
      switch (option) {
        case "roma":
          return cn(baseClasses, "bg-semantic-roma text-text-body");
        case "kana":
          return cn(baseClasses, "bg-semantic-kana text-text-body");
        case "english":
          return cn(baseClasses, "bg-semantic-english text-text-body");
        case "romakana":
          return cn(baseClasses, "bg-semantic-roma text-text-body");
        case "all":
          return cn(baseClasses, "text-text-body");
        default:
          return cn(baseClasses, "bg-background text-text-body");
      }
    }

    return cn(baseClasses, "hover:opacity-80 bg-background text-foreground");
  };

  const getBackgroundStyle = (option: FilterMode, checked: boolean) => {
    if (checked && option === "all") {
      return {
        background: "linear-gradient(to right, var(--semantic-roma), var(--semantic-kana), var(--semantic-english))",
      };
    }
    return {};
  };

  return (
    <CustomToolTip label="Enterで検索" placement="top">
      <label className="flex-1">
        <RadioGroupItem value={value} className="sr-only" />
        <div className={getCardStyles(option, checked)} style={getBackgroundStyle(option, checked)}>
          {children}
        </div>
      </label>
    </CustomToolTip>
  );
}

const options: { value: FilterMode; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "roma", label: "ローマ字" },
  { value: "kana", label: "かな" },
  { value: "romakana", label: "ローマ字&かな" },
  { value: "english", label: "英語" },
];

const SearchModeRadio = () => {
  const modeAtom = useSearchResultModeState();
  const setModeAtom = useSetSearchResultMode();
  const handleKeyDown = useSearchKeydown();

  return (
    <RadioGroup
      value={modeAtom}
      onValueChange={(value) => setModeAtom(value as FilterMode)}
      className="mb-3"
      onKeyDown={handleKeyDown}
    >
      <div className="flex w-full gap-0">
        {options.map((option) => (
          <RadioCard key={option.value} option={option.value} value={option.value} checked={modeAtom === option.value}>
            {option.label}
          </RadioCard>
        ))}
      </div>
    </RadioGroup>
  );
};

export default SearchModeRadio;
