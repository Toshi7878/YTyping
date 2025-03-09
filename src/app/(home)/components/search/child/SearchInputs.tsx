"use client";

import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { Button, HStack, Input } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useIsSearchingAtom, useSetIsSearchingAtom } from "../../../atoms/atoms";

const SearchInputs = () => {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams?.get("keyword") || "");
  const isSearching = useIsSearchingAtom();
  const setIsSearching = useSetIsSearchingAtom();
  const setDifficultyRangeParams = useSetDifficultyRangeParams();
  const router = useRouter();

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams(searchParams.toString());

      if (keyword.trim()) {
        params.set("keyword", keyword.trim());
      } else {
        params.delete("keyword");
      }

      setIsSearching(true);
      router.replace(`?${setDifficultyRangeParams(params).toString()}`);
    } finally {
      setIsSearching(false);
    }
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

      <Button
        width="30%"
        isLoading={isSearching}
        loadingText="検索中"
        type="submit"
        aria-label="検索を実行"
      >
        検索
      </Button>
    </HStack>
  );
};

export default SearchInputs;
