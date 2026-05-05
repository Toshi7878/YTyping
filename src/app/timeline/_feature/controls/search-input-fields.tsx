"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { useIsSearching } from "@/shared/result/list";
import { useResultListFilterQueryStates } from "../search-params";

export const SearchInputs = () => {
  const isSearching = useIsSearching();
  const [filterParams, setFilterParams] = useResultListFilterQueryStates();
  const [keywords, setKeywords] = useState({
    mapKeyword: filterParams.mapKeyword,
    username: filterParams.username,
  });

  const applyKeywords = () => {
    setFilterParams({ mapKeyword: keywords.mapKeyword.trim(), username: keywords.username.trim() });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyKeywords();
    }
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
      <Button className="w-[30%]" onClick={applyKeywords} disabled={isSearching} loading={isSearching}>
        検索
      </Button>
    </div>
  );
};
