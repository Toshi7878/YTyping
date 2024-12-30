import { getTypeAtomStore } from "@/app/type/[id]/TypeProvider";
import { Text } from "@chakra-ui/react";
import { Atom, useAtomValue } from "jotai";
import { memo } from "react";

const typeAtomStore = getTypeAtomStore();

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const value = useAtomValue(atom, { store: typeAtomStore });

  return (
    <Text as="span" fontSize="4xl" className="value">
      {value}
    </Text>
  );
};

export default memo(StatusValue);
