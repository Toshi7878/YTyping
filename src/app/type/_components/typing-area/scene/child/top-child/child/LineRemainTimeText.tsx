import { useDisplayLineRemainTimeAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Text } from "@chakra-ui/react";
import React from "react";

const LineRemainTimeText = () => {
  const displayLineRemainTime = useDisplayLineRemainTimeAtom();
  return <Text as="span">{displayLineRemainTime.toFixed(1)}</Text>;
};

export default LineRemainTimeText;
