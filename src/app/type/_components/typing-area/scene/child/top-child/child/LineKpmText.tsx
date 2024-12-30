import { useDisplayLineKpmAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Text } from "@chakra-ui/react";
import React from "react";

const LineKpmText = () => {
  const displayLineKpm = useDisplayLineKpmAtom();

  return <Text as="span">{displayLineKpm.toFixed(0)}</Text>;
};

export default LineKpmText;
