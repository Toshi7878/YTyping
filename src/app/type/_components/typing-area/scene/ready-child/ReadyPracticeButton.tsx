import { gameStateRefAtom } from "@/app/type/atoms/refAtoms";
import { useOnClickPracticeReplay } from "@/app/type/hooks/useOnClickPracticeReplay";
import { ThemeColors } from "@/types";
import { Button, useTheme } from "@chakra-ui/react";
import { useStore } from "jotai";

const ReadyPracticeButton = () => {
  const theme: ThemeColors = useTheme();
  const typeAtomStore = useStore();
  const handleClick = useOnClickPracticeReplay({
    startMode: "practice",
    resultId: typeAtomStore.get(gameStateRefAtom).practice.myResultId || null,
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
