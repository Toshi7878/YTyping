"use client";
import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  StackProps,
  useTheme,
} from "@chakra-ui/react";

import { useSetVolumeState, useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { ThemeColors } from "@/types";
import { YTPlayer } from "@/types/global-types";
import { useState } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";

interface VolumeRangeProps {
  player: YTPlayer;
}

export default function VolumeRange({ player, ...props }: VolumeRangeProps & StackProps) {
  const theme: ThemeColors = useTheme();
  const volumeAtom = useVolumeState();
  const setVolumeAtom = useSetVolumeState();
  const [showSliderMark, setShowSliderMark] = useState(false);

  const handleChange = (value: number) => {
    setVolumeAtom(value);
    if (player) {
      player.setVolume(value);
    }
  };
  return (
    <HStack alignItems="center" {...props}>
      <Box>
        {volumeAtom === 0 ? (
          <IoMdVolumeMute size={24} />
        ) : volumeAtom < 50 ? (
          <IoMdVolumeLow size={24} />
        ) : (
          <IoMdVolumeHigh size={24} />
        )}
      </Box>

      <Slider
        size="lg"
        w="200px"
        aria-label="slider-ex-1"
        onChange={handleChange}
        max={100}
        value={volumeAtom}
        onMouseEnter={() => setShowSliderMark(true)}
        onMouseLeave={() => setShowSliderMark(false)}
      >
        {showSliderMark && (
          <SliderMark
            value={volumeAtom}
            textAlign="center"
            bg={theme.colors.background.body}
            color={theme.colors.text.body}
            border="1px"
            borderColor={theme.colors.border.card}
            mt="-10"
            ml="-4"
            w="8"
          >
            {volumeAtom}
          </SliderMark>
        )}
        <SliderTrack>
          <SliderFilledTrack bg={theme.colors.primary.main} />
        </SliderTrack>

        <SliderThumb />
      </Slider>
    </HStack>
  );
}
