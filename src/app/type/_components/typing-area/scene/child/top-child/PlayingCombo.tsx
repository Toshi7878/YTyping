import { useComboAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";
import React from "react";

const PlayingCombo = () => {
  const combo = useComboAtom();

  return <Box fontSize="3xl">{combo}</Box>;
};

export default PlayingCombo;
