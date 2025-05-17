import { Box, BoxProps } from "@chakra-ui/react";
import { useStatusState } from "../../../atom/stateAtoms";

const ResultScore = (props: BoxProps) => {
  const statusState = useStatusState();
  return <Box {...props}>スコア: {statusState.score}点</Box>;
};

export default ResultScore;
