import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type SortIconState = "asc" | "desc" | "inactive" | "random-active" | "random-inactive";
const ACTIVE_SORT_STATES = new Set<SortIconState>(["asc", "desc", "random-active"]);
interface SortButtonProps {
  label: string;
  sortState: SortIconState;
  onClick: () => void;
}

export const SortToggleButton = ({ label, sortState, onClick }: SortButtonProps) => (
  <Button
    variant="ghost"
    className={cn(
      "group gap-1 text-base transition-none",
      ACTIVE_SORT_STATES.has(sortState) && "bg-accent font-bold text-secondary-light hover:text-secondary-light",
    )}
    onClick={onClick}
  >
    <span>{label}</span>
    <SortIndicator sortState={sortState} />
  </Button>
);

interface SortIndicatorProps {
  sortState: SortIconState;
}

const SortIndicator = ({ sortState }: SortIndicatorProps) => {
  if (sortState === "random-active") return <FaSort className="group-hover:visible" />;
  if (sortState === "random-inactive") return <FaSort className="invisible group-hover:visible" />;
  if (sortState === "asc") return <FaSortUp />;
  if (sortState === "desc") return <FaSortDown />;
  return <FaSortDown className="invisible group-hover:visible" />;
};
