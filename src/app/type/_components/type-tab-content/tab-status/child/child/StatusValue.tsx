import { Text } from "@chakra-ui/react";
import { Atom, useAtomValue, useStore } from "jotai";
import { memo } from "react";

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const typeAtomStore = useStore();
  const value = useAtomValue(atom, { store: typeAtomStore });

  return (
    <Text as="span" fontSize={{ base: "4rem", md: "4xl" }} className="value">
      {value}
    </Text>
  );
};

export default memo(StatusValue);
