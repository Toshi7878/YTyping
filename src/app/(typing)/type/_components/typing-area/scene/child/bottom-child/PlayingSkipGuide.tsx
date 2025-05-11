import { useSkipState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";

const PlayingSkipGuide = () => {
  const skip = useSkipState();

  return <Box opacity={0.6}>{skip ? `Type ${skip} key to Skip. ⏩` : ""}</Box>;
};
export default PlayingSkipGuide;
