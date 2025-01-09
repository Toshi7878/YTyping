import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";
import React from "react";

interface ResultToolTipTextProps {
  romaType: number;
  kanaType: number;
  flickType: number;
  miss: number;
  correctRate: string;
  lost: number;
  isPerfect: boolean;
  maxCombo: number;
  kpm: number;
  rkpm: number;
  romaKpm: number;
  isKanaFlickTyped: boolean;
  defaultSpeed: number;
  updatedAt: Date;
}

const ResultToolTipText = (props: ResultToolTipTextProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Box fontSize="sm" lineHeight={7}>
      {props.romaType > 0 && (
        <Box>
          <Text as="span">ローマ字タイプ数</Text>:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {props.romaType}
          </Text>
        </Box>
      )}
      {props.kanaType > 0 && (
        <Box>
          <Text as="span">かな入力タイプ数</Text>:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {props.kanaType}
          </Text>
        </Box>
      )}
      {props.flickType > 0 && (
        <Box>
          <Text as="span">フリック入力タイプ数</Text>:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {props.flickType}
          </Text>
        </Box>
      )}
      <Box>
        ミス数:{" "}
        <Text as="span" fontSize="md" fontWeight="bold">
          {props.miss} ({props.correctRate}%)
        </Text>
      </Box>
      <Box>
        ロスト数:{" "}
        <Text as="span" fontSize="md" fontWeight="bold">
          {props.lost}
        </Text>
      </Box>
      <Box>
        最大コンボ:{" "}
        <Text
          as="span"
          {...(props.isPerfect && { color: theme.colors.semantic.perfect })}
          className={`${props.isPerfect ? "outline-text" : ""}`}
          fontSize="md"
          fontWeight="bold"
        >
          {props.maxCombo}
        </Text>
      </Box>
      <Box>
        rkpm:{" "}
        <Text as="span" fontSize="md" fontWeight="bold">
          {props.rkpm}
        </Text>
      </Box>
      {props.isKanaFlickTyped && props.kpm !== props.romaKpm && (
        <Box>
          <Text as="span">ローマ字換算kpm</Text>:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {props.romaKpm}
          </Text>
        </Box>
      )}
      {props.defaultSpeed > 1 && (
        <Box>
          倍速:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {props.defaultSpeed.toFixed(2)}x
          </Text>
        </Box>
      )}
      <Box>
        日時:{" "}
        <Text as="span" fontSize="md">
          {new Date(props.updatedAt).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Box>
    </Box>
  );
};

export default ResultToolTipText;
