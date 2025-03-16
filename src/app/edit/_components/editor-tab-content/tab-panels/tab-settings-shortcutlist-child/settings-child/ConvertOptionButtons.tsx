"use client";
import { useSetWordConvertOptionState, useWordConvertOptionState } from "@/app/edit/atoms/storageAtoms";
import { ConvertOptionsType } from "@/app/edit/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { LOOSE_SYMBOL_LIST, MANDATORY_SYMBOL_LIST, STRICT_SYMBOL_LIST } from "@/config/consts/charList";
import { ThemeColors } from "@/types";
import { Box, Button, FormLabel, HStack, RadioGroup, Stack, useTheme } from "@chakra-ui/react";
import { useMemo } from "react";

export default function ConvertOptionButtons() {
  const theme: ThemeColors = useTheme();
  const wordConvertOption = useWordConvertOptionState();
  const setWordConvertOption = useSetWordConvertOptionState();

  const options = useMemo(
    () => [
      {
        colorScheme: "green",
        label: "記号なし(一部除く)",
        value: "non_symbol",
        tooltipLabel: (
          <Box>
            <Box>一部の記号を除いてワードに記号を含まずよみ変換します。</Box>
            <Box>変換される記号:{MANDATORY_SYMBOL_LIST.join(" ")}</Box>
          </Box>
        ),
      },
      {
        colorScheme: "yellow",
        label: "記号あり(一部)",
        value: "add_symbol",
        tooltipLabel: (
          <Box>
            <Box>一部の記号をよみ変換されるようにします。</Box>
            <Box>変換される記号:{MANDATORY_SYMBOL_LIST.concat(LOOSE_SYMBOL_LIST).join(" ")}</Box>
          </Box>
        ),
      },
      {
        colorScheme: "red",
        label: "記号あり(すべて)",
        value: "add_symbol_all",
        tooltipLabel: (
          <Box>
            <Box>キーボードで入力できる全ての記号をよみ変換されるようにします。</Box>
            <Box>
              変換される記号:
              {MANDATORY_SYMBOL_LIST.concat(LOOSE_SYMBOL_LIST).concat(STRICT_SYMBOL_LIST).join(" ")}
            </Box>
          </Box>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme]
  );

  return (
    <HStack alignItems="baseline">
      <FormLabel fontSize="sm">読み変換</FormLabel>

      <RadioGroup
        onChange={(nextValue: string) => setWordConvertOption(nextValue as ConvertOptionsType)}
        value={wordConvertOption}
      >
        <Stack direction="row">
          {options.map((option) => (
            <CustomToolTip label={option.tooltipLabel} key={option.label} placement="bottom">
              <Button
                variant={wordConvertOption === option.value ? "solid" : "outline"}
                size="sm"
                width="150px"
                height="50px"
                name="word-convert-option"
                bg={wordConvertOption === option.value ? undefined : theme.colors.background.body}
                colorScheme={option.colorScheme}
                value={option.value}
                onClick={() => setWordConvertOption(option.value as ConvertOptionsType)}
              >
                {option.label}
              </Button>
            </CustomToolTip>
          ))}
        </Stack>
      </RadioGroup>
    </HStack>
  );
}
