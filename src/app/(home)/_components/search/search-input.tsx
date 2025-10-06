"use client";

import { useQueryStates } from "nuqs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { mapListSearchParams } from "@/utils/queries/search-params/map-list";
import { useIsSearchingState, useReadDifficultyRange, useSetIsSearching } from "../../_lib/atoms";

export const SearchInput = () => {
  const [params, setParams] = useQueryStates(mapListSearchParams);
  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const readDifficultyRange = useReadDifficultyRange();

  return (
    <form
      className="flex items-center gap-3 select-none"
      onSubmit={(e) => {
        e.preventDefault();
        setIsSearching(true);
        setParams({ keyword: keyword.trim(), ...readDifficultyRange() }, { history: "replace" });
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
