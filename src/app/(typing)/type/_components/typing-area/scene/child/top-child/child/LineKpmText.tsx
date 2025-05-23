import { useLineKpmState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Text } from "@chakra-ui/react";

const LineKpmText = () => {
  const displayLineKpm = useLineKpmState();

  return <Text as="span">{displayLineKpm.toFixed(0)}</Text>;
};

export default LineKpmText;
