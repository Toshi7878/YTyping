"use client";
import {
  Box,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  useTheme,
} from "@chakra-ui/react";

import { useSetVolumeAtom, useVolumeAtom } from "@/lib/global-atoms/globalAtoms";
import { ThemeColors } from "@/types";
import { useState } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";

interface VolumeRangeProps {
  playerRef: any;
}

export default function VolumeRange({ playerRef }: VolumeRangeProps) {
  const theme: ThemeColors = useTheme();
  const volumeAtom = useVolumeAtom();
  const setVolumeAtom = useSetVolumeAtom();
  const [showSliderMark, setShowSliderMark] = useState(false);

  const handleChange = (value: number) => {
    setVolumeAtom(value);
    if (playerRef.current) {
      playerRef.current.setVolume(value);
    }
  };
  return (
    <HStack alignItems="center">
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
