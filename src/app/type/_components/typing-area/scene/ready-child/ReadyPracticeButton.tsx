import { usegameUtilityReferenceParams } from "@/app/type/atoms/refAtoms";
import { useMapState } from "@/app/type/atoms/stateAtoms";
import { useLoadResultPlay } from "@/app/type/hooks/loadResultPlay";
import { ThemeColors } from "@/types";
import { Button, useTheme } from "@chakra-ui/react";

const ReadyPracticeButton = () => {
  const map = useMapState();
  const theme: ThemeColors = useTheme();
  const { readGameUtilRefParams } = usegameUtilityReferenceParams();
  const handleClick = useLoadResultPlay({
    startMode: "practice",
    resultId: readGameUtilRefParams().practiceMyResultId || null,
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
      onClick={map ? handleClick : undefined}
    >
      練習モードで開始
    </Button>
  );
};

export default ReadyPracticeButton;
