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
    other: theme.colors.semantic.other,
  };

  // 共通のテキストレンダリング関数
  const renderText = (label: string, color: string) => (
    <Text as="span" color={color} className="input-mode-outline-text">
      {label}
    </Text>
  );

  // 各入力モードの合計値を算出
  const total =
    props.romaType +
    props.kanaType +
    props.flickType +
    props.englishType +
    props.spaceType +
    props.numType +
    props.symbolType;

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

  if (total > 0 && props.englishType / total >= 0.1) {
    const inputMode = props.flickType
      ? "flick"
      : props.romaType >= props.kanaType
      ? "roma"
      : "kana";

    const inputLabel =
      inputMode === "flick" ? "フリック" : inputMode === "roma" ? "ローマ字" : "かな";

    return (
      <Box isTruncated whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
        {renderText(inputLabel, colors[inputMode])}
        <Text as="span" color={theme.colors.text.body}>
          ・
        </Text>
        {renderText("英語", colors.english)}
      </Box>
    );
  }

  // その他の入力モードを優先順位順で判定
  if (props.romaType) return renderText("ローマ字", colors.roma);
  if (props.kanaType) return renderText("かな", colors.kana);
  if (props.flickType) return renderText("フリック", colors.flick);
  if (props.englishType) return renderText("英語", colors.english);
  if (props.numType || props.spaceType || props.symbolType)
    return renderText("その他", colors.other);

  return null;
};
