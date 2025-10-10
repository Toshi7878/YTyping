"use client";

import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { mapListSearchParams } from "@/utils/queries/schema/map-list";
import { useIsSearchingState, useReadPendingDifficultyRange } from "../../_lib/atoms";
import { useSetParams } from "../../_lib/use-set-params";

export const SearchInput = () => {
  const [params] = useQueryStates(mapListSearchParams);
  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const isSearching = useIsSearchingState();
  const readPendingDifficultyRange = useReadPendingDifficultyRange();
  const setParams = useSetParams();

  return (
    <form
      className="flex items-center gap-3 select-none"
      onSubmit={(e) => {
        e.preventDefault();
        setParams({ keyword: keyword.trim(), ...readPendingDifficultyRange() });
      }}
    >
      <Input
        value={keyword}
        placeholder="キーワードを入力"
        type="search"
        aria-label="検索キーワード"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <Button className="w-20 md:w-60" loading={isSearching} type="submit" aria-label="検索を実行">
        {isSearching ? "検索中" : "検索"}
      </Button>
    </form>
  );
};
