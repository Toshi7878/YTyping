"use client";

import { useSetDifficultyRangeState, useSetIsSearchingState } from "@/app/(home)/atoms/atoms";
import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { DIFFICULTY_RANGE, PARAM_NAME } from "@/app/(home)/ts/consts";
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
import { useState } from "react";

interface SearchRangeProps {
  step: number;
}

const SearchRange = ({ step, ...rest }: SearchRangeProps & BoxProps) => {
  const theme: ThemeColors = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { min, max } = DIFFICULTY_RANGE;
  const [difficultyRange, setDifficultyRange] = useState<{ min: number; max: number }>({
    min: Number(searchParams.get(PARAM_NAME.minRate)) || min,
    max: Number(searchParams.get(PARAM_NAME.maxRate)) || max,
  });

  const setDifficultyRangeParams = useSetDifficultyRangeParams();
  const setDifficultyRangeAtom = useSetDifficultyRangeState();
  const setIsSearchingAtom = useSetIsSearchingState();

  const handleChange = (val: number[]) => {
    setDifficultyRange({ min: val[0], max: val[1] });
    setDifficultyRangeAtom({ min: val[0], max: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      const newParams = setDifficultyRangeParams(params);
      if (newParams.toString() !== searchParams.toString()) {
        setIsSearchingAtom(true);
        router.replace(`?${newParams.toString()}`);
      }
    }
  };

  return (
    <Box
      minH="75px"
      bg={"background.card"}
      p={1}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.card60"
      height="100%"
    >
      <CustomToolTip label="Enterで検索" placement="top">
        <Box
          flex="1"
          width="170px"
          position="relative"
          top={4}
          userSelect="none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <RangeSlider
            value={[difficultyRange.min, difficultyRange.max]}
            min={min}
            max={max}
            size="lg"
            step={step}
            onChange={handleChange}
          >
            <RangeSliderTrack height="6px">
              <RangeSliderFilledTrack bg={theme.colors.primary.main} />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} p={1} />
            <RangeSliderThumb index={1} p={1} />
          </RangeSlider>
          <Flex position="absolute" width="100%" justifyContent="space-between" top={5}>
            <Text fontSize="md">★{difficultyRange.min.toFixed(1)}</Text>
            <Text fontSize="md">★{difficultyRange.max === max ? "∞" : difficultyRange.max.toFixed(1)}</Text>
          </Flex>
        </Box>
      </CustomToolTip>
    </Box>
  );
};

export default SearchRange;
