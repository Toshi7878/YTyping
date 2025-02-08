import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";

interface ResultToolTipTextProps {
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  numType: number;
  spaceType: number;
  symbolType: number;
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
      <TypeCountResult
        romaType={props.romaType}
        kanaType={props.kanaType}
        flickType={props.flickType}
        englishType={props.englishType}
        numType={props.numType}
        symbolType={props.symbolType}
        spaceType={props.spaceType}
      />
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

interface TypeCountResultProps {
  romaType: number;
  kanaType: number;
  flickType: number;
  englishType: number;
  numType: number;
  spaceType: number;
  symbolType: number;
}

const TypeCountResult = (props: TypeCountResultProps) => {
  // 各入力タイプの情報を配列にまとめる
  const types = [
    { label: "ローマ字タイプ数", value: props.romaType },
    { label: "かな入力タイプ数", value: props.kanaType },
    { label: "フリック入力タイプ数", value: props.flickType },
    { label: "英語タイプ数", value: props.englishType },
    { label: "数字タイプ数", value: props.numType },
    { label: "記号タイプ数", value: props.symbolType },
    { label: "スペースタイプ数", value: props.spaceType },
  ];

  // 総入力数を計算
  const total = types.reduce((sum, type) => sum + type.value, 0);
  // カウントが0より大きい入力タイプの数
  const typesUsedCount = types.filter((type) => type.value > 0).length;

  return (
    <>
      {types.map(
        (type, index) =>
          type.value > 0 && (
            <Box key={index}>
              <Text as="span">{type.label}</Text>:{" "}
              <Text as="span" fontSize="md" fontWeight="bold">
                {type.value}
              </Text>
            </Box>
          )
      )}
      {typesUsedCount > 1 && (
        <Box>
          <Text as="span">合計タイプ数</Text>:{" "}
          <Text as="span" fontSize="md" fontWeight="bold">
            {total}
          </Text>
        </Box>
      )}
    </>
  );
};
export default ResultToolTipText;
