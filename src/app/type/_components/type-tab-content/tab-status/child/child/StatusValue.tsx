import { getTypeAtomStore } from "@/app/type/atoms/stateAtoms";
import { Text } from "@chakra-ui/react";
import { Atom, useAtomValue } from "jotai";
import { memo } from "react";

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const typeAtomStore = getTypeAtomStore();
  const value = useAtomValue(atom, { store: typeAtomStore });

  return (
    <Text as="span" fontSize={{ base: "4rem", md: "4xl" }} className="value">
      {value}
    </Text>
  );
};

export default memo(StatusValue);
