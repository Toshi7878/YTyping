"use client";
import { useIsSearchingState, useSetIsSearching } from "@/app/timeline/atoms/atoms";
import { useSetSearchParams } from "@/app/timeline/hook/useSetSearchParams";
import { PARAM_NAME } from "@/app/timeline/ts/const/consts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchInputs = () => {
  const searchParams = useSearchParams();
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearching();
  const router = useRouter();
  const [keyword, setKeyword] = useState({
    mapKeyWord: searchParams?.get(PARAM_NAME.mapkeyword) || "",
    userName: searchParams?.get(PARAM_NAME.username) || "",
  });
  const rangeParams = useSetSearchParams();

  const handleSearch = async () => {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword.mapKeyWord.trim()) {
      params.set(PARAM_NAME.mapkeyword, keyword.mapKeyWord.trim());
    } else {
      params.delete(PARAM_NAME.mapkeyword);
    }

    if (keyword.userName.trim()) {
      params.set(PARAM_NAME.username, keyword.userName.trim());
    } else {
      params.delete(PARAM_NAME.username);
    }

    const updatedParams = rangeParams(params).toString();
    const currentParams = searchParams.toString();

    if (updatedParams === currentParams) {
      return;
    }

    setIsSearching(true);
    router.replace(`?${updatedParams}`);
  };

  return (
    <div className="flex gap-2">
      <Input
        value={keyword.mapKeyWord}
        type="search"
        placeholder="譜面キーワードで絞り込み"
        onChange={(e) => setKeyword((prev) => ({ ...prev, mapKeyWord: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Input
        placeholder="ユーザーネームで絞り込み"
        type="search"
        value={keyword.userName}
        onChange={(e) => setKeyword((prev) => ({ ...prev, userName: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Button className="w-[30%]" onClick={handleSearch} disabled={isSearching}>
        {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        検索
      </Button>
    </div>
  );
};

export default SearchInputs;
