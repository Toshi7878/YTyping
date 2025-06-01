"use client";

import { useDifficultyRangeParams } from "@/app/(home)/hook/useDifficultyRangeParams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useIsSearchingState, useSetIsSearching } from "../../../atoms/atoms";

const SearchInputs = () => {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const setDifficultyRangeParams = useDifficultyRangeParams();
  const router = useRouter();

  const handleSearch = async () => {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    } else {
      params.delete("keyword");
    }

    // 更新後のパラメータが現在のURLと同じ場合は何もしない
    const updatedParams = setDifficultyRangeParams(params).toString();
    const currentParams = searchParams.toString();

    if (updatedParams === currentParams) {
      return;
    }

    setIsSearching(true);
    router.replace(`?${updatedParams}`);
  };

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Input
        value={keyword}
        placeholder="キーワードを入力"
        type="search"
        aria-label="検索キーワード"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <Button className="w-60" loading={isSearching} type="submit" aria-label="検索を実行">
        {isSearching ? "検索中" : "検索"}
      </Button>
    </form>
  );
};

export default SearchInputs;
