import { TypeResult } from "@/app/type/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Flex, Text, useTheme } from "@chakra-ui/react";
import { memo } from "react";

interface ResultCardBodyProps {
  lineKanaWord: string;
  typeResult: TypeResult[];
  lineTypeWord: string;
  lostWord: string;
}

function ResultCardBody({ lineKanaWord, typeResult, lineTypeWord, lostWord }: ResultCardBodyProps) {
  const theme: ThemeColors = useTheme();

  let correctCount = 0;
  return (
    <Flex flexDirection="column" gap={2}>
      <Box className="kana-word">
        <Box>{lineKanaWord}</Box>
      </Box>
      <Box
        color={theme.colors.text.body}
        textTransform="uppercase"
        className="word-result outline-text"
        letterSpacing="0.15em"
      >
        {typeResult.map((type: TypeResult, index: number) => {
          if (type.is) {
            correctCount++;
          }

          const label = `time: ${type.t.toFixed(3)}, kpm: ${Math.round(correctCount / (type.t / 60))}`;

          return (
            type.c && (
              <CustomToolTip key={index} label={label} placement="top" fontSize="sm">
                <Text
                  as="span"
                  className="typed"
                  data-time={type.t}
                  _hover={{ bg: `${theme.colors.border.card}70` }}
                  color={
                    type.is
                      ? lostWord === ""
                        ? theme.colors.semantic.word.completed
                        : theme.colors.semantic.word.correct
                      : theme.colors.error.main
                  }
                  wordBreak="break-all"
                >
                  {type.c.replace(/ /g, "ˍ")}
                </Text>
              </CustomToolTip>
            )
          );
        })}
        <Text as="span" wordBreak="break-all">
          {lostWord !== null ? lostWord : lineTypeWord}
        </Text>
      </Box>
    </Flex>
  );
}

export default memo(ResultCardBody);
