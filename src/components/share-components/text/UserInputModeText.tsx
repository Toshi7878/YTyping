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

  const colors = {
    roma: theme.colors.semantic.roma,
    kana: theme.colors.semantic.kana,
    flick: theme.colors.semantic.flick,
    english: theme.colors.semantic.english,
    num: theme.colors.semantic.num,
    other: theme.colors.semantic.other,
  };

  // 共通のテキストレンダリング関数
  const renderText = (label: string, color: string) => (
    <Text as="span" color={color} className="input-mode-outline-text">
      {label}
    </Text>
  );

  // romaType と kanaType の両方が存在する場合、数値の大小で表示順序を決定
  if (props.romaType && props.kanaType) {
    const isRomaFirst = props.romaType >= props.kanaType;
    const first = isRomaFirst
      ? { label: "ローマ字", color: colors.roma }
      : { label: "かな", color: colors.kana };
    const second = isRomaFirst
      ? { label: "かな", color: colors.kana }
      : { label: "ローマ字", color: colors.roma };

    return (
      <Box isTruncated whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        {renderText(first.label, first.color)}
        <Text as="span" color={theme.colors.text.body}>
          ・
        </Text>
        {renderText(second.label, second.color)}
      </Box>
    );
  }

  // その他の入力モードを優先順位順で判定
  if (props.romaType) return renderText("ローマ字", colors.roma);
  if (props.kanaType) return renderText("かな", colors.kana);
  if (props.flickType) return renderText("フリック", colors.flick);
  if (props.englishType) return renderText("英語", colors.english);
  if (props.numType) return renderText("数字", colors.num);
  if (props.spaceType || props.symbolType) return renderText("その他", colors.other);

  return null;
};
