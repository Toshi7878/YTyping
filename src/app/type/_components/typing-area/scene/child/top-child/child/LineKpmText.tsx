import { useDisplayLineKpmAtom } from "@/app/type/atoms/stateAtoms";
import { Text } from "@chakra-ui/react";

const LineKpmText = () => {
  const displayLineKpm = useDisplayLineKpmAtom();

  return <Text as="span">{displayLineKpm.toFixed(0)}</Text>;
};

export default LineKpmText;
