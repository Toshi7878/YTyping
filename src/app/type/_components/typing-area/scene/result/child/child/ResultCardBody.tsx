import { TypeResult } from "@/app/type/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Text, useTheme } from "@chakra-ui/react";
import { memo } from "react";

interface ResultCardBodyProps {
  lineKanaWord: string;
  typeResult: TypeResult[];
  lineTypeWord: string;
  lostWord: string;
}

function ResultCardBody({ lineKanaWord, typeResult, lineTypeWord, lostWord }: ResultCardBodyProps) {
  const theme: ThemeColors = useTheme();

  return (
    <>
      <Box className="kana-word">
        <Box>{lineKanaWord}</Box>
      </Box>
      <Box
        color={theme.colors.text.body}
        ml={1}
        textTransform="uppercase"
        className="word-result outline-text"
        letterSpacing="0.1em"
      >
        {typeResult.map(
          (type: TypeResult, index: number) =>
            type.c && (
              <CustomToolTip
                key={index}
                label={`time: ${type.t.toFixed(3)}`}
                placement="top"
                fontSize="sm"
              >
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
        )}
        <Text as="span" wordBreak="break-all">
          {lostWord !== null ? lostWord : lineTypeWord}
        </Text>
      </Box>
    </>
  );
}

export default memo(ResultCardBody);