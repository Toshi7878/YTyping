"use client";

import { useTranslations } from "next-intl";
import { FilterFieldsPopover } from "@/app/timeline/_feature/controls/filter-popover";
import { SearchInputs } from "@/app/timeline/_feature/controls/search-input-fields";
import { SortControls } from "@/app/timeline/_feature/controls/sort";
import { useResultListFilterQueryStates, useResultListSortQueryState } from "@/app/timeline/_feature/search-params";
import { ResultList } from "@/shared/result/list/list";
import { Button } from "@/ui/button";
import { CardWithContent } from "@/ui/card";
import { P } from "@/ui/typography";
import { useInvalidResultsQueryState } from "../search-params";
import { useInvalidResultCount } from "./use-invalid-result-count";

export const UserResultList = ({ userId }: { userId: string }) => {
  const t = useTranslations("user.resultList");
  const [filterParams] = useResultListFilterQueryStates();
  const [sort] = useResultListSortQueryState();
  const [showInvalid, setShowInvalid] = useInvalidResultsQueryState();
  const invalidResultCount = useInvalidResultCount(userId);
  const invalidOnly = showInvalid && invalidResultCount > 0;

  return (
    <div className="space-y-3">
      <SearchInputs showUsername={false} />
      <CardWithContent className={{ card: "p-0", cardContent: "flex flex-wrap items-center justify-between p-1.5" }}>
        <SortControls />
        <div className="flex items-center gap-3">
          {invalidResultCount > 0 && (
            <Button
              variant={invalidOnly ? "default" : "outline"}
              onClick={() => void setShowInvalid(invalidOnly ? null : true)}
            >
              {t("reviewRecords", { count: invalidResultCount })}
            </Button>
          )}
          <FilterFieldsPopover />
        </div>
      </CardWithContent>
      {invalidOnly && <P className="text-muted-foreground text-sm">{t("reviewNote")}</P>}
      <ResultList filterParams={{ ...filterParams, playerId: Number(userId), invalidOnly }} sort={sort} />
    </div>
  );
};
