import { useComboState } from "@/app/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";

const PlayingCombo = () => {
  const combo = useComboState();

  return <Box>{combo}</Box>;
};

export default PlayingCombo;
