import { useComboAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";

const PlayingCombo = () => {
  const combo = useComboAtom();

  return <Box>{combo}</Box>;
};

export default PlayingCombo;
