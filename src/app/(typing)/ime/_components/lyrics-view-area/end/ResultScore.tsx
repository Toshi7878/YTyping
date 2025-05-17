import { Box } from "@chakra-ui/react";
import { useStatusState } from "../../../atom/stateAtoms";

const ResultScore = () => {
  const statusState = useStatusState();
  return (
    <Box position="absolute" top="0">
      スコア: {statusState.score}点
    </Box>
  );
};

export default ResultScore;
