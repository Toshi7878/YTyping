import { useTranslations } from "next-intl";
import { type SortIconState, SortToggleButton } from "@/ui/sort-toggle-button";
import type { RESULT_SORT_OPTIONS } from "@/validator/result/list";
import { type ResultListSortSearchParams, useResultListSortQueryState } from "../search-params";

export const SortControls = () => {
  const t = useTranslations("timeline.sort");
  const sortOptions: { label: string; value: (typeof RESULT_SORT_OPTIONS)[number] }[] = [
    { label: t("updatedAt"), value: "updatedAt" },
    { label: t("typeCount"), value: "type-count" },
    { label: t("maxCombo"), value: "max-combo" },
    { label: t("clap"), value: "clap-count" },
    { label: t("pp"), value: "pp" },
  ];
  const [currentSort, setSortParam] = useResultListSortQueryState();

  return (
    <div className="flex select-none flex-wrap items-center gap-0.5">
      {sortOptions.map(({ label, value }) => (
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
