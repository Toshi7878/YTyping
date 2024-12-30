import React from "react";
import { HStack, useRadioGroup, useTheme, useRadio, UseRadioProps, Box } from "@chakra-ui/react";
import { FilterMode } from "@/app/timeline/ts/type";
import { ThemeColors } from "@/types";
import { useSearchResultModeAtom, useSetSearchResultModeAtom } from "@/app/timeline/atoms/atoms";
interface RadioCardProps extends UseRadioProps {
  option: FilterMode;
  children: React.ReactNode;
}
function RadioCard({ option, children, ...props }: RadioCardProps) {
  const { getInputProps, getRadioProps } = useRadio(props);
  const theme: ThemeColors = useTheme();

  const input = getInputProps();
  const checkbox = getRadioProps();
  const allBg = "#FFFFFF";
  const romaBg = theme.colors.semantic.roma;
  const kanaBg = theme.colors.semantic.kana;
  const flickBg = theme.colors.semantic.flick;
  const selectedBg = option === "roma" ? romaBg : option === "kana" ? kanaBg : allBg;

  return (
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
        px={2}
        py={1}
      >
        {children}
      </Box>
    </Box>
  );
}

const options: { value: FilterMode; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "roma", label: "ローマ字" },
  { value: "kana", label: "かな" },
  { value: "romakana", label: "ローマ字&かな" },
];
const SearchModeRadio = () => {
  const modeAtom = useSearchResultModeAtom();
  const setModeAtom = useSetSearchResultModeAtom();
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "modeFilter",
    defaultValue: modeAtom,
    onChange: (value) => {
      setModeAtom(value as FilterMode);
    },
  });

  const group = getRootProps();

  return (
    <HStack {...group} spacing={0} width={"100%"} mb={3}>
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
