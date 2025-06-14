import useSearchKeydown from "@/app/timeline/hook/useSearchKeydown";
import { DualRangeSlider } from "@/components/ui/dural-range-slider";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Dispatch } from "react";

interface SearchRangeProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: { minValue: number; maxValue: number };
  setValue: Dispatch<{ minValue: number; maxValue: number }>;
}

const SearchRange = ({ label, min, max, step, value, setValue }: SearchRangeProps) => {
  const handleKeyDown = useSearchKeydown();

  return (
    <div>
      <div className="mb-2 text-sm">{`${value.minValue} - ${
        value.maxValue === 1200 && label === "kpm" ? "All" : value.maxValue
      } ${label}`}</div>
      <TooltipWrapper label="Enterで検索">
        <DualRangeSlider
          value={[value.minValue, value.maxValue]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => {
            setValue({ minValue: val[0], maxValue: val[1] });
          }}
          onKeyDown={handleKeyDown}
          className="my-4"
        />
      </TooltipWrapper>
    </div>
  );
};

export default SearchRange;
