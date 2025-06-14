import { Atom, useAtomValue, useStore } from "jotai";
import { memo } from "react";

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const typeAtomStore = useStore();
  const value = useAtomValue(atom, { store: typeAtomStore });

  return (
    <span className="value text-4xl md:text-4xl">
      {value}
    </span>
  );
};

export default memo(StatusValue);
