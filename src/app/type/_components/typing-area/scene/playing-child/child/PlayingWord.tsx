import { useUserTypingOptionsAtom } from "@/app/type/atoms/stateAtoms";
import { ThemeColors } from "@/types";
import { Box, BoxProps, Text, useTheme } from "@chakra-ui/react";

interface WordProps {
  correct: string;
  nextChar: string;
  word: string;
  id: string;
  isLineCompleted: boolean;
  nextWord: string;
}

const PlayingWord = ({
  correct,
  nextChar,
  word,
  isLineCompleted,
  nextWord,
  ...rest
}: WordProps & BoxProps) => {
  const remainWord = nextChar + word;
  const theme: ThemeColors = useTheme();
  const userOptionsAtom = useUserTypingOptionsAtom();
  const isNextWordDisplay = userOptionsAtom.line_completed_display === "NEXT_WORD";

  return (
    <Box {...rest}>
      {isLineCompleted && isNextWordDisplay ? (
        <Text as="span" className="next-line-word" color={theme.colors.semantic.word.nextWord}>
          {nextWord}
        </Text>
      ) : (
        <>
          <Text
            as="span"
            color={
              remainWord.length === 0
                ? theme.colors.semantic.word.completed
                : theme.colors.semantic.word.correct
            }
            className={remainWord.length === 0 ? "word-completed" : "word-correct"}
          >
            {correct}
          </Text>
          <Text as="span" color={theme.colors.semantic.word.nextChar} className="word-next">
            {nextChar}
          </Text>
          <Text as="span" color={theme.colors.semantic.word.word} className="word">
            {word}
          </Text>
        </>
      )}
    </Box>
  );
};

export default PlayingWord;
