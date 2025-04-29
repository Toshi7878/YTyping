import useSearchKeydown from "@/app/timeline/hook/useSearchKeydown";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import {
  Box,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  useTheme,
} from "@chakra-ui/react";
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
  const theme: ThemeColors = useTheme();
  const handleKeyDown = useSearchKeydown();

  return (
    <Box>
      <Text>{`${value.minValue} - ${
        value.maxValue === 1200 && label === "kpm" ? "All" : value.maxValue
      } ${label}`}</Text>
      <CustomToolTip label="Enterで検索" placement="top">
        <RangeSlider
          defaultValue={[value.minValue, value.maxValue]}
          min={min}
          max={max}
          size={"lg"}
          step={step}
          onChange={(val) => {
            setValue({ minValue: val[0], maxValue: val[1] });
          }}
          onKeyDown={handleKeyDown}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack bg={theme.colors.primary.main} />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
      </CustomToolTip>
    </Box>
  );
};

export default SearchRange;
