import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Atom, useAtomValue, useStore } from "jotai";
import { focusTypingStatusAtoms } from "../../../_lib/atoms/stateAtoms";

export default function StatusCell({ label }: { label: string }) {
  return (
    <TableCell id={label} style={{ width: label === "score" || label === "point" ? "20%" : "14%" }}>
      <StatusLabel label={label} />
      <StatusUnderline label={label} />

      {label === "point" ? (
        <PointStatusValue atom={focusTypingStatusAtoms[label]} timeBonusAtom={focusTypingStatusAtoms["timeBonus"]} />
      ) : (
        <StatusValue atom={focusTypingStatusAtoms[label]} />
      )}
    </TableCell>
  );
}

const StatusLabel = ({ label }: { label: string }) => {
  return (
    <span
      className={cn(
        "status-label relative mr-2 text-[3.5rem] capitalize md:text-[80%]",
        label === "kpm" && "tracking-[0.2em]",
      )}
    >
      {label}
    </span>
  );
};

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

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const typeAtomStore = useStore();
  const value = useAtomValue(atom, { store: typeAtomStore });

  return <span className="value text-4xl md:text-4xl">{value}</span>;
};

const StatusUnderline = ({ label }: { label: string }) => {
  const isMainWidth = label === "score" || label === "point";

  const underlineWidthClass = isMainWidth ? "w-[159px]" : "w-20";

  return (
    <span className="status-underline relative">
      <span className={cn("bg-card-foreground absolute bottom-0 left-0.5 h-0.5", underlineWidthClass)} />
    </span>
  );
};
