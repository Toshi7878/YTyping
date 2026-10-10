import { type SortIconState, SortToggleButton } from "@/ui/sort-toggle-button";
import type { RESULT_SORT_OPTIONS } from "@/validator/result/list";
import { type ResultListSortSearchParams, useResultListSortQueryState } from "../search-params";

const SORT_OPTIONS: { label: string; value: (typeof RESULT_SORT_OPTIONS)[number] }[] = [
  { label: "更新日", value: "updatedAt" },
  { label: "打鍵数", value: "type-count" },
  { label: "最大コンボ", value: "max-combo" },
  { label: "拍手数", value: "clap-count" },
  { label: "pp", value: "pp" },
];

export const SortControls = () => {
  const [currentSort, setSortParam] = useResultListSortQueryState();

  return (
    <div className="flex select-none flex-wrap items-center gap-0.5">
      {SORT_OPTIONS.map(({ label, value }) => (
        <SortToggleButton
          key={value}
          label={label}
          sortState={deriveSortIconState(value, currentSort)}
          onClick={() => void setSortParam(deriveNextSortParam(value, currentSort))}
        />
      ))}
    </div>
  );
};

const deriveNextSortParam = (
  type: (typeof RESULT_SORT_OPTIONS)[number],
  currentSort: ResultListSortSearchParams,
): ResultListSortSearchParams => {
  if (currentSort.type !== type) return { type, isDesc: true };
  if (currentSort.isDesc) return { type, isDesc: false };
  return { type: "updatedAt", isDesc: true };
};

const deriveSortIconState = (
  type: (typeof RESULT_SORT_OPTIONS)[number],
  currentSort: ResultListSortSearchParams,
): SortIconState => {
  if (currentSort.type !== type) return "inactive";
  return currentSort.isDesc ? "desc" : "asc";
};
