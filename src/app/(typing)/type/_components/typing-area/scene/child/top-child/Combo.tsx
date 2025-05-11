import { useComboState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Box } from "@chakra-ui/react";

const Combo = () => {
  const combo = useComboState();

  return <Box>{combo}</Box>;
};

export default Combo;
