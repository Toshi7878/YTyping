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
    <span className="value text-4xl md:text-4xl">
      {value.toString()}
      <small>{timeBonusValue > 0 && `+${timeBonusValue.toString()}`}</small>
    </span>
  );
};

export default memo(PointStatusValue);
