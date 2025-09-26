"use client"
import type { Atom } from "jotai"
import { useAtomValue, useStore } from "jotai"
import { TableCell } from "@/components/ui/table/table"
import { cn } from "@/lib/utils"
import { focusTypingStatusAtoms } from "../../../_lib/atoms/state-atoms"

export default function StatusCell({ label }: { label: string }) {
  return (
    <TableCell id={label} style={{ width: label === "score" || label === "point" ? "20%" : "14%" }}>
      <StatusLabel label={label} />
      <StatusUnderline label={label} />

      <span className="value text-5xl md:text-[2.2rem]">
        {label === "point" ? (
          <PointStatusValue atom={focusTypingStatusAtoms[label]} timeBonusAtom={focusTypingStatusAtoms.timeBonus} />
        ) : (
          <StatusValue atom={focusTypingStatusAtoms[label]} />
        )}
      </span>
    </TableCell>
  )
}

const StatusLabel = ({ label }: { label: string }) => {
  return (
    <span className={cn("status-label relative mr-2 capitalize md:text-[80%]", label === "kpm" && "tracking-[0.2em]")}>
      {label}
    </span>
  )
}

interface PointStatusValueProps {
  atom: Atom<number>
  timeBonusAtom: Atom<number>
}

const PointStatusValue = ({ atom, timeBonusAtom }: PointStatusValueProps) => {
  const typeAtomStore = useStore()

  const value = useAtomValue(atom, { store: typeAtomStore })
  const timeBonusValue = useAtomValue(timeBonusAtom, { store: typeAtomStore })

  return (
    <>
      {value.toString()}
      <small>{timeBonusValue > 0 && `+${timeBonusValue.toString()}`}</small>
    </>
  )
}

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const typeAtomStore = useStore()
  const value = useAtomValue(atom, { store: typeAtomStore })

  return <>{value}</>
}

const StatusUnderline = ({ label }: { label: string }) => {
  const isMainWidth = label === "score" || label === "point"

  const underlineWidthClass = isMainWidth ? "w-[159px]" : "w-20"

  return (
    <span className="relative">
      <span
        id="status_underline"
        className={cn("bg-card-foreground absolute bottom-0 left-0.5 h-0.5", underlineWidthClass)}
      />
    </span>
  )
}
