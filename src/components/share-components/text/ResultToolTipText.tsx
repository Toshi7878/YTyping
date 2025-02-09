import { ThemeColors } from "@/types";
import { Box, Divider, HStack, Text, useTheme, VStack } from "@chakra-ui/react";

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
    <Box p={4}>
      <VStack spacing={3} align="start">
        <TypeCountResult
          romaType={props.romaType}
          kanaType={props.kanaType}
          flickType={props.flickType}
          englishType={props.englishType}
          numType={props.numType}
          symbolType={props.symbolType}
          spaceType={props.spaceType}
        />
        <Divider />

        <HStack spacing={2}>
          <Text>ミス数:</Text>
          <Text fontSize="md" fontWeight="bold">
            {props.miss} ({props.correctRate}%)
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Text>ロスト数:</Text>
          <Text fontSize="md" fontWeight="bold">
            {props.lost}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Text>最大コンボ:</Text>
          <Text
            as="span"
            fontSize="md"
            fontWeight="bold"
            color={props.isPerfect ? theme.colors.semantic.perfect : undefined}
            className={props.isPerfect ? "outline-text" : undefined}
          >
            {props.maxCombo}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Text>rkpm:</Text>
          <Text fontSize="md" fontWeight="bold">
            {props.rkpm}
          </Text>
        </HStack>

        {props.isKanaFlickTyped && props.kpm !== props.romaKpm && (
          <HStack spacing={2}>
            <Text>ローマ字換算kpm:</Text>
            <Text fontSize="md" fontWeight="bold">
              {props.romaKpm}
            </Text>
          </HStack>
        )}

        {props.defaultSpeed > 1 && (
          <HStack spacing={2}>
            <Text>倍速:</Text>
            <Text fontSize="md" fontWeight="bold">
              {props.defaultSpeed.toFixed(2)}x
            </Text>
          </HStack>
        )}

        <HStack spacing={2}>
          <Text>日時:</Text>
          <Text fontSize="md">
            {new Date(props.updatedAt).toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </HStack>
      </VStack>
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
  const types = [
    { label: "ローマ字タイプ数", value: props.romaType },
    { label: "かな入力タイプ数", value: props.kanaType },
    { label: "フリック入力タイプ数", value: props.flickType },
    { label: "アルファベットタイプ数", value: props.englishType },
    { label: "数字タイプ数", value: props.numType },
    { label: "記号タイプ数(スペース含)", value: props.symbolType + props.spaceType },
  ];

  const total = types.reduce((sum, type) => sum + type.value, 0);
  const typesUsedCount = types.filter((type) => type.value > 0).length;

  return (
    <VStack spacing={1} align="start">
      {types.map(
        (type, index) =>
          type.value > 0 && (
            <HStack key={index} spacing={2}>
              <Text>{type.label}:</Text>
              <Text fontSize="md" fontWeight="bold">
                {type.value}
              </Text>
            </HStack>
          )
      )}
      {typesUsedCount > 1 && (
        <HStack spacing={2}>
          <Text>合計タイプ数:</Text>
          <Text fontSize="md" fontWeight="bold">
            {total}
          </Text>
        </HStack>
      )}
    </VStack>
  );
};

export default ResultToolTipText;
