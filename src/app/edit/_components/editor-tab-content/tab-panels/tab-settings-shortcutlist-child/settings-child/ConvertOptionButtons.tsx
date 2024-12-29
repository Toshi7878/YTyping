"use client";
import { Box, Button, FormLabel, HStack, RadioGroup, Stack, useTheme } from "@chakra-ui/react";
import { ThemeColors } from "@/types";
import { ConvertOptionsType } from "@/app/edit/ts/type";
import { useMemo } from "react";
import { addSymbol, addSymbolAll, nonSymbol } from "@/app/edit/hooks/useWordConvert";
import {
  useEditWordConvertOptionAtom,
  useSetEditWordConvertOptionAtom,
} from "@/app/edit/edit-atom/editAtom";
import { sendEditorOptionIndexedDBData } from "@/lib/db";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";

export default function ConvertOptionButtons() {
  const theme: ThemeColors = useTheme();
  const setSelectedConvertOption = useSetEditWordConvertOptionAtom();
  const selectedConvertOption = useEditWordConvertOptionAtom();

  const options = useMemo(
    () => [
      {
        colorScheme: "green",
        label: "記号なし(一部除く)",
        value: "non_symbol",
        tooltipLabel: (
          <Box>
            <Box>一部の記号を除いてワードに記号を含まずよみ変換します。</Box>
            <Box>変換される記号:{nonSymbol.join(" ")}</Box>
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
            <Box>変換される記号:{nonSymbol.concat(addSymbol).join(" ")}</Box>
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
            <Box>変換される記号:{nonSymbol.concat(addSymbol).concat(addSymbolAll).join(" ")}</Box>
          </Box>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  return (
    <HStack alignItems="baseline">
      <FormLabel fontSize="sm">読み変換</FormLabel>

      <RadioGroup
        onChange={(nextValue: string) => setSelectedConvertOption(nextValue as ConvertOptionsType)}
        value={selectedConvertOption}
      >
        <Stack direction="row">
          {options.map((option) => (
            <CustomToolTip tooltipLabel={option.tooltipLabel} key={option.label} placement="bottom">
              <Button
                variant={selectedConvertOption === option.value ? "solid" : "outline"}
                size="sm"
                width="150px"
                height="50px"
                name="word-convert-option"
                bg={
                  selectedConvertOption === option.value ? undefined : theme.colors.background.body
                }
                colorScheme={option.colorScheme}
                value={option.value}
                onClick={(e) => {
                  setSelectedConvertOption(option.value as ConvertOptionsType);
                  sendEditorOptionIndexedDBData(e.target as HTMLInputElement);
                }}
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
