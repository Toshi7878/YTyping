import { useComboAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";

const PlayingCombo = () => {
  const combo = useComboAtom();

  return <Box fontSize={{ base: "3.5rem", sm: "2.7rem", md: "3xl" }}>{combo}</Box>;
};

export default PlayingCombo;
