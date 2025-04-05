"use client";

import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { Button, HStack, Input } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useIsSearchingState, useSetIsSearchingState } from "../../../atoms/atoms";

const SearchInputs = () => {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const isSearching = useIsSearchingState();
  const setIsSearching = useSetIsSearchingState();
  const setDifficultyRangeParams = useSetDifficultyRangeParams();
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
    <HStack
      spacing={3}
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Input
        size="md"
        value={keyword}
        placeholder="キーワードを入力"
        type="search"
        aria-label="検索キーワード"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <Button width="30%" isLoading={isSearching} loadingText="検索中" type="submit" aria-label="検索を実行">
        検索
      </Button>
    </HStack>
  );
};

export default SearchInputs;
