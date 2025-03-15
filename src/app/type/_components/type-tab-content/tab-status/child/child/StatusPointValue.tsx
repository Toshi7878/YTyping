import { Text } from "@chakra-ui/react";
import { Atom, useAtomValue, useStore } from "jotai";
import { memo } from "react";

interface PointStatusValueProps {
  atom: Atom<number>;
  timeBonusAtom: Atom<number>;
}

const PointStatusValue = ({ atom, timeBonusAtom }: PointStatusValueProps) => {
  const typeAtomStore = useStore();

  const value = useAtomValue(atom, { store: typeAtomStore });
  const timeBonusValue = useAtomValue(timeBonusAtom, { store: typeAtomStore });

  return (
    <Text as="span" fontSize={{ base: "4rem", md: "4xl" }} className="value">
      {value.toString()}
      <small>{timeBonusValue > 0 && `+${timeBonusValue.toString()}`}</small>
    </Text>
  );
};

export default memo(PointStatusValue);
