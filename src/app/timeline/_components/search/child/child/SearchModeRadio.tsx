import { useSearchResultModeState, useSetSearchResultMode } from "@/app/timeline/atoms/atoms";
import useSearchKeydown from "@/app/timeline/hook/useSearchKeydown";
import { FilterMode } from "@/app/timeline/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, HStack, useRadio, useRadioGroup, UseRadioProps, useTheme } from "@chakra-ui/react";
import React from "react";

interface RadioCardProps extends UseRadioProps {
  option: FilterMode;
  children: React.ReactNode;
}

function RadioCard({ option, children, ...props }: RadioCardProps) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const theme: ThemeColors = useTheme();

  const input = getInputProps();
  const checkbox = getRadioProps();

  const { selectedBg, hoverBg } = useRadioCardBackground(option, theme);

  return (
    <CustomToolTip label="Enterで検索" placement="top">
      <Box as="label">
        <input {...input} />
        <Box
          {...checkbox}
          cursor="pointer"
          borderWidth="1px"
          boxShadow="md"
          fontSize="xx-small"
          borderColor={theme.colors.border.card}
          className="select-none"
          _hover={{
            bg: hoverBg,
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
          px={2}
          py={1}
        >
          {children}
        </Box>
      </Box>
    </CustomToolTip>
  );
}

function useRadioCardBackground(option: FilterMode, theme: ThemeColors) {
  const allBg = `linear-gradient(to right, ${theme.colors.semantic.roma}, ${theme.colors.semantic.kana}, ${theme.colors.semantic.english})`;

  const romaBg = theme.colors.semantic.roma;
  const kanaBg = theme.colors.semantic.kana;
  const engBg = theme.colors.semantic.english;

  const selectedBg =
    option === "roma"
      ? romaBg
      : option === "kana"
      ? kanaBg
      : option === "english"
      ? engBg
      : option === "romakana"
      ? romaBg
      : allBg;

  // ホバー時のグラデーション設定
  const hoverBg =
    option === "all"
      ? `linear-gradient(to right, ${theme.colors.semantic.roma}80, ${theme.colors.semantic.kana}80, ${theme.colors.semantic.english}80)`
      : `${selectedBg}80`;

  return { selectedBg, hoverBg };
}

const options: { value: FilterMode; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "roma", label: "ローマ字" },
  { value: "kana", label: "かな" },
  { value: "romakana", label: "ローマ字&かな" },
  { value: "english", label: "英語" },
];
const SearchModeRadio = () => {
  const modeAtom = useSearchResultModeState();
  const setModeAtom = useSetSearchResultMode();
  const handleKeyDown = useSearchKeydown();
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "modeFilter",
    defaultValue: modeAtom,
    onChange: (value) => {
      setModeAtom(value as FilterMode);
    },
  });

  const group = getRootProps();

  return (
    <HStack {...group} spacing={0} width={"100%"} mb={3} onKeyDown={handleKeyDown}>
      {options.map((option) => {
        const radio = getRadioProps({ value: option.value });
        return (
          <RadioCard key={option.value} option={option.value} {...radio}>
            {option.label}
          </RadioCard>
        );
      })}
    </HStack>
  );
};

export default SearchModeRadio;
