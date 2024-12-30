import { useSkipAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box } from "@chakra-ui/react";
import React from "react";

const PlayingSkipGuide = () => {
  const skip = useSkipAtom();

  return <Box opacity={0.6}>{skip ? `Type ${skip} key to Skip. ⏩` : ""}</Box>;
};
export default PlayingSkipGuide;
