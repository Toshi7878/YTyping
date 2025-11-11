"use client";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useIsSearchingState } from "@/app/timeline/_lib/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { resultListSearchParams } from "@/lib/search-params/result-list";
import { useSetSearchParams } from "../../_lib/use-set-search-params";

export const SearchInputs = () => {
  const isSearching = useIsSearchingState();
  const [mapKeyword] = useQueryState("mapKeyword", resultListSearchParams.mapKeyword);
  const [username] = useQueryState("username", resultListSearchParams.username);

  const [keywords, setKeywords] = useState({ mapKeyword, username });
  const setSearchParams = useSetSearchParams();

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchParams({ mapKeyword: keywords.mapKeyword.trim(), username: keywords.username.trim() });
    }
  };

  const onClick = () => {
    setSearchParams({ mapKeyword: keywords.mapKeyword.trim(), username: keywords.username.trim() });
  };

  return (
    <div className="flex gap-2">
      <Input
        value={keywords.mapKeyword}
        type="search"
        placeholder="譜面キーワードで絞り込み"
        onChange={(e) => setKeywords((prev) => ({ ...prev, mapKeyword: e.target.value }))}
        onKeyDown={onKeyDown}
      />
      <Input
        value={keywords.username}
        placeholder="ユーザーネームで絞り込み"
        type="search"
        onChange={(e) => setKeywords((prev) => ({ ...prev, username: e.target.value }))}
        onKeyDown={onKeyDown}
      />
      <Button className="w-[30%]" onClick={onClick} disabled={isSearching} loading={isSearching}>
        検索
      </Button>
    </div>
  );
};
