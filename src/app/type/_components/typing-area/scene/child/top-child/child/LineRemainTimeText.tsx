import { useDisplayLineRemainTimeAtom } from "@/app/type/atoms/stateAtoms";
import { Text } from "@chakra-ui/react";

const LineRemainTimeText = () => {
  const displayLineRemainTime = useDisplayLineRemainTimeAtom();
  return <Text as="span">{displayLineRemainTime.toFixed(1)}</Text>;
};

export default LineRemainTimeText;
