"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import {
  Box,
  BoxProps,
  Flex,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchRangeProps {
  min: number;
  max: number;
  step: number;
}

const SearchRange = ({ min, max, step, ...rest }: SearchRangeProps & BoxProps) => {
  const theme: ThemeColors = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const minParamName = "minRate";
  const maxParamName = "maxRate";

  const [value, setValue] = useState(() => {
    const minParamValue = searchParams.get(minParamName);
    const maxParamValue = searchParams.get(maxParamName);

    return {
      minValue: minParamValue ? Math.max(min, Number(minParamValue)) : min,
      maxValue: maxParamValue ? Math.min(max, Number(maxParamValue)) : max,
    };
  });

  useEffect(() => {
    const minParamValue = searchParams.get(minParamName);
    const maxParamValue = searchParams.get(maxParamName);

    setValue({
      minValue: minParamValue ? Math.max(min, Number(minParamValue)) : min,
      maxValue: maxParamValue ? Math.min(max, Number(maxParamValue)) : max,
    });
  }, [searchParams, min, max, minParamName, maxParamName]);

  useEffect(() => {
    if (value.minValue < min || value.maxValue > max) {
      setValue({
        minValue: Math.max(min, value.minValue),
        maxValue: Math.min(max, value.maxValue),
      });
    }
  }, [min, max, value, setValue]);

  const handleChange = (val: number[]) => {
    setValue({ minValue: val[0], maxValue: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      if (value.minValue === min) {
        params.delete(minParamName);
      } else {
        params.set(minParamName, value.minValue.toFixed(1));
      }

      if (value.maxValue === max) {
        params.delete(maxParamName);
      } else {
        params.set(maxParamName, value.maxValue.toFixed(1));
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <CustomToolTip label="Enterで検索" placement="top">
      <Box
        flex="1"
        minWidth="150px"
        maxWidth="150px"
        position="relative"
        userSelect="none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <RangeSlider
          value={[value.minValue, value.maxValue]}
          min={min}
          max={max}
          size="lg"
          step={step}
          onChange={handleChange}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack bg={theme.colors.primary.main} />
          </RangeSliderTrack>
          <RangeSliderThumb index={0} />
          <RangeSliderThumb index={1} />
        </RangeSlider>
        <Flex position="absolute" width="100%" justifyContent="space-between" top={5}>
          <Text fontSize="sm">★{value.minValue.toFixed(1)}</Text>
          <Text fontSize="sm">★{value.maxValue === max ? "∞" : value.maxValue.toFixed(1)}</Text>
        </Flex>
      </Box>
    </CustomToolTip>
  );
};

export default SearchRange;
