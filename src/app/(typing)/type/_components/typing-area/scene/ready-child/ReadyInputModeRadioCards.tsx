"use client";
import { useSetPlayingInputMode } from "@/app/(typing)/type/atoms/stateAtoms";
import { useReadyInputModeState, useSetReadyInputMode } from "@/app/(typing)/type/atoms/storageAtoms";
import { InputMode } from "@/app/(typing)/type/ts/type";
import { ThemeColors } from "@/types";
import { Box, HStack, useRadio, useRadioGroup, UseRadioProps, useTheme } from "@chakra-ui/react";
import React from "react";

interface RadioCardProps extends UseRadioProps {
  option: InputMode;
  children: React.ReactNode;
}
function RadioCard({ option, children, ...props }: RadioCardProps) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const theme: ThemeColors = useTheme();

  const input = getInputProps();
  const checkbox = getRadioProps();
  const romaBg = theme.colors.semantic.roma;
  const kanaBg = theme.colors.semantic.kana;
  const flickBg = theme.colors.semantic.flick;
  const selectedBg = option === "roma" ? romaBg : option === "kana" ? kanaBg : flickBg;

  return (
    <Box as="label" minW="33.33%">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        boxShadow="md"
        fontWeight="bold"
        borderColor={theme.colors.border.card}
        className="select-none"
        _hover={{
          bg: `${selectedBg}80`,
          color: theme.colors.text.body,
        }}
        _checked={{
          bg: selectedBg,
          color: theme.colors.text.body,
          borderColor: theme.colors.border.card,

          _hover: {
            bg: selectedBg,
          },
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={15}
        py="2.6rem"
        fontSize={{ base: "2.75rem", md: "3xl" }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function ReadyInputModeRadioCards() {
  const options: { value: InputMode; label: string }[] = [
    { value: "roma", label: "ローマ字入力" },
    { value: "kana", label: "かな入力" },
    { value: "flick", label: "フリック入力" },
  ];

  const readyInputMode = useReadyInputModeState();
  const setReadyInputMode = useSetReadyInputMode();
  const setPlayingInputMode = useSetPlayingInputMode();

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "inputMode",
    defaultValue: readyInputMode,
    onChange: (value) => {
      setReadyInputMode(value as InputMode);
      setPlayingInputMode(value as InputMode);
    },
  });

  const group = getRootProps();

  return (
    <HStack {...group} spacing={0} width="100%">
      {options.map((option) => {
        const radio = getRadioProps({ value: option.value });
        return (
          <RadioCard key={option.value} option={option.value} {...radio} isDisabled={option.value === "flick"}>
            {option.label}
          </RadioCard>
        );
      })}
    </HStack>
  );
}

export default ReadyInputModeRadioCards;
