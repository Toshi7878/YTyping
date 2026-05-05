import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { cn } from "@/lib/tailwind";
import { Button } from "./button";

export type SortIconState = "asc" | "desc" | "inactive" | "random-active" | "random-inactive";
const ACTIVE_SORT_STATES = new Set<SortIconState>(["asc", "desc", "random-active"]);
interface SortButtonProps {
  label: string;
  sortState: SortIconState;
  onClick: () => void;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}

export const SortToggleButton = ({ label, sortState, onClick, className, size }: SortButtonProps) => (
  <Button
    variant="ghost"
    size={size}
    className={cn(
      "group gap-0.5 transition-none has-[>svg]:px-2",
      className,
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
