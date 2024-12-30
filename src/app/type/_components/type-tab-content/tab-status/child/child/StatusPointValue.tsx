import { getTypeAtomStore } from "@/app/type/[id]/TypeProvider";
import { Text } from "@chakra-ui/react";
import { Atom, useAtomValue } from "jotai";
import { memo } from "react";

interface PointStatusValueProps {
  atom: Atom<number>;
  timeBonusAtom: Atom<number>;
}
const typeAtomStore = getTypeAtomStore();

const PointStatusValue = ({ atom, timeBonusAtom }: PointStatusValueProps) => {
  const value = useAtomValue(atom, { store: typeAtomStore });
  const timeBonusValue = useAtomValue(timeBonusAtom, { store: typeAtomStore });

  return (
    <>
      <Text as="span" fontSize="4xl" className="value">
        {value.toString()}
        <small>{timeBonusValue > 0 && `+${timeBonusValue.toString()}`}</small>
      </Text>
    </>
  );
};

export default memo(PointStatusValue);
