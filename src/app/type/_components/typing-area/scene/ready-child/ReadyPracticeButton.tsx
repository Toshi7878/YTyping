import { useOnClickPracticeReplay } from "@/app/type/hooks/useOnClickPracticeReplay";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import { ThemeColors } from "@/types";
import { Button, useTheme } from "@chakra-ui/react";

const ReadyPracticeButton = () => {
  const theme: ThemeColors = useTheme();
  const { gameStateRef } = useRefs();

  const handleClick = useOnClickPracticeReplay({
    startMode: "practice",
    resultId: gameStateRef.current?.practice.myResultId || null,
  });

  return (
    <Button
      variant="outline"
      borderColor={theme.colors.border.card}
      color={theme.colors.text.body}
      px={16}
      py={6}
      size="xl"
      fontSize={{ base: "3rem", md: "3xl" }}
      _hover={{
        bg: theme.colors.button.sub.hover,
      }}
      onClick={handleClick}
    >
      練習モードで開始
    </Button>
  );
};

export default ReadyPracticeButton;
