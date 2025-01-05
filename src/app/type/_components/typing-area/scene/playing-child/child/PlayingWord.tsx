import { ThemeColors } from "@/types";
import { Box, BoxProps, Text, useTheme } from "@chakra-ui/react";

interface WordProps {
  correct: string;
  nextChar: string;
  word: string;
  id: string;
}

const PlayingWord = ({ correct, nextChar, word, ...rest }: WordProps & BoxProps) => {
  const remainWord = nextChar + word;
  const theme: ThemeColors = useTheme();

  return (
    <Box {...rest}>
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
      <Text as="span" color={theme.colors.semantic.word.next} className="word-next">
        {nextChar}
      </Text>
      <Text as="span" color={theme.colors.semantic.word.word} className="word">
        {word}
      </Text>
    </Box>
  );
};

export default PlayingWord;
