"use client";

import {
  useDifficultyRangeAtom,
  useSetDifficultyRangeAtom,
  useSetIsSearchingAtom,
} from "@/app/(home)/atoms/atoms";
import { DIFFICULTY_RANGE } from "@/app/(home)/ts/const/consts";
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
import { useEffect } from "react";

interface SearchRangeProps {
  step: number;
}

const SearchRange = ({ step, ...rest }: SearchRangeProps & BoxProps) => {
  const theme: ThemeColors = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { min, max } = DIFFICULTY_RANGE;
  const minParamName = "minRate";
  const maxParamName = "maxRate";
  const difficultyRangeAtom = useDifficultyRangeAtom();
  const setDifficultyRangeAtom = useSetDifficultyRangeAtom();
  const setIsSearchingAtom = useSetIsSearchingAtom();

  useEffect(() => {
    const minParamValue = searchParams.get(minParamName);
    const maxParamValue = searchParams.get(maxParamName);

    setDifficultyRangeAtom({
      min: minParamValue ? Math.max(min, Number(minParamValue)) : min,
      max: maxParamValue ? Math.min(max, Number(maxParamValue)) : max,
    });
  }, [searchParams, min, max, minParamName, maxParamName]);

  useEffect(() => {
    if (difficultyRangeAtom.min < min || difficultyRangeAtom.max > max) {
      setDifficultyRangeAtom({
        min: Math.max(min, difficultyRangeAtom.min),
        max: Math.min(max, difficultyRangeAtom.max),
      });
    }
  }, [min, max, difficultyRangeAtom, setDifficultyRangeAtom]);

  const handleChange = (val: number[]) => {
    setDifficultyRangeAtom({ min: val[0], max: val[1] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());

      if (difficultyRangeAtom.min === min) {
        params.delete(minParamName);
      } else {
        params.set(minParamName, difficultyRangeAtom.min.toFixed(1));
      }

      if (difficultyRangeAtom.max === max) {
        params.delete(maxParamName);
      } else {
        params.set(maxParamName, difficultyRangeAtom.max.toFixed(1));
      }

      setIsSearchingAtom(true);
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
          value={[difficultyRangeAtom.min, difficultyRangeAtom.max]}
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
          <Text fontSize="md">★{difficultyRangeAtom.min.toFixed(1)}</Text>
          <Text fontSize="md">
            ★{difficultyRangeAtom.max === max ? "∞" : difficultyRangeAtom.max.toFixed(1)}
          </Text>
        </Flex>
      </Box>
    </CustomToolTip>
  );
};

export default SearchRange;
