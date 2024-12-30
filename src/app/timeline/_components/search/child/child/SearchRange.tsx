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

  return (
    <Box>
      <Text>{`${value.minValue} - ${value.maxValue === 1200 && label === "kpm" ? "All" : value.maxValue} ${label}`}</Text>
      <RangeSlider
        defaultValue={[value.minValue, value.maxValue]}
        min={min}
        max={max}
        size={"lg"}
        step={step}
        onChange={(val) => {
          setValue({ minValue: val[0], maxValue: val[1] });
        }}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack bg={theme.colors.primary.main} />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
    </Box>
  );
};

export default SearchRange;
