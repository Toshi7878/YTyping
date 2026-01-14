"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { useMapListFilterQueryStates } from "@/lib/search-params/map-list";
import { useIsSearchingState } from "../../_lib/atoms";
import { useSetSearchParams } from "../../_lib/use-set-search-params";

export const SearchInput = () => {
  const [params] = useMapListFilterQueryStates();
  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const isSearching = useIsSearchingState();
  const setSearchParams = useSetSearchParams();

  useEffect(() => {
    setKeyword(params.keyword ?? "");
  }, [params.keyword]);

  return (
    <form
      className="flex select-none items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSearchParams({ keyword: keyword.trim() });
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
