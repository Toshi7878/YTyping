"use client";
import { Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useIsSearchingState } from "@/app/timeline/_lib/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { resultListSearchParams } from "@/utils/queries/schema/result-list";
import { useSetParams } from "../../_lib/use-set-search-params";

export const SearchInputs = () => {
  const isSearching = useIsSearchingState();
  const [mapKeyWord] = useQueryState("mapKeyword", resultListSearchParams.mapKeyword);
  const [username] = useQueryState("username", resultListSearchParams.username);

  const [keywords, setKeywords] = useState({ mapKeyWord, username });
  const setParams = useSetParams();

  return (
    <div className="flex gap-2">
      <Input
        value={keywords.mapKeyWord}
        type="search"
        placeholder="譜面キーワードで絞り込み"
        onChange={(e) => setKeywords((prev) => ({ ...prev, mapKeyWord: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setParams({ ...keywords });
          }
        }}
      />
      <Input
        value={keywords.username}
        placeholder="ユーザーネームで絞り込み"
        type="search"
        onChange={(e) => setKeywords((prev) => ({ ...prev, username: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setParams({ ...keywords });
          }
        }}
      />
      <Button
        className="w-[30%]"
        onClick={() => {
          setParams({ ...keywords });
        }}
        disabled={isSearching}
      >
        {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        検索
      </Button>
    </div>
  );
};
