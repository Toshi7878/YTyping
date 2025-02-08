import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";

interface UserInputModeTextProps {
  kanaType: number;
  romaType: number;
  flickType: number;
  englishType: number;
  spaceType: number;
  numType: number;
  symbolType: number;
}

export const UserInputModeText = (props: UserInputModeTextProps) => {
  const theme: ThemeColors = useTheme();

  const romaColor = theme.colors.semantic.roma;
  const kanaColor = theme.colors.semantic.kana;
  const flickColor = theme.colors.semantic.flick;
  const englishColor = theme.colors.semantic.english;
  const numColor = theme.colors.semantic.num;
  const otherColor = theme.colors.semantic.other;

  if (props.romaType && props.kanaType) {
    if (props.romaType >= props.kanaType) {
      return (
        <Box isTruncated whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          <Text as="span" color={romaColor} className="input-mode-outline-text">
            ローマ字
          </Text>
          <Text as="span" color={theme.colors.text.body}>
            ・
          </Text>
          <Text as="span" color={kanaColor} className="input-mode-outline-text">
            かな
          </Text>
        </Box>
      );
    } else {
      return (
        <Box isTruncated whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          <Text as="span" color={kanaColor} className="input-mode-outline-text">
            かな
          </Text>
          <Text as="span" color={theme.colors.text.body}>
            ・
          </Text>
          <Text as="span" color={romaColor} className="input-mode-outline-text">
            ローマ字
          </Text>
        </Box>
      );
    }
  } else {
    if (props.romaType) {
      return (
        <Text as="span" color={romaColor} className="input-mode-outline-text">
          ローマ字
        </Text>
      );
    }
    if (props.kanaType) {
      return (
        <Text as="span" color={kanaColor} className="input-mode-outline-text">
          かな
        </Text>
      );
    } else if (props.flickType) {
      return (
        <Text as="span" color={flickColor} className="input-mode-outline-text">
          フリック
        </Text>
      );
    } else if (props.englishType) {
      return (
        <Text as="span" color={englishColor} className="input-mode-outline-text">
          英語
        </Text>
      );
    } else if (props.numType) {
      return (
        <Text as="span" color={numColor} className="input-mode-outline-text">
          数字
        </Text>
      );
    } else if (props.spaceType || props.symbolType) {
      return (
        <Text as="span" color={otherColor} className="input-mode-outline-text">
          その他
        </Text>
      );
    }
  }
  return null;
};
