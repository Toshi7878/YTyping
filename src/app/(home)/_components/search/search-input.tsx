"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDifficultyRangeParams } from "@/app/(home)/_lib/use-difficulty-range-params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { useIsSearchingState, useReadDifficultyRange, useSetIsSearching } from "../../_lib/atoms";

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const setDifficultyRangeParams = useDifficultyRangeParams();
  const readDifficultyRange = useReadDifficultyRange();

  const handleSearch = async () => {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    } else {
      params.delete("keyword");
    }

    const updatedParams = setDifficultyRangeParams(params, readDifficultyRange()).toString();
    const currentParams = searchParams.toString();

    if (updatedParams === currentParams) {
      return;
    }

    setIsSearching(true);
    window.history.replaceState(null, "", `?${updatedParams}`);
  };

  return (
    <form
      className="flex items-center gap-3 select-none"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSearch();
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
