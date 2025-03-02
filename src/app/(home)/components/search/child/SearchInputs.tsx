"use client";

import { Button, HStack, Input } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchMapKeyWordsAtom, useSetSearchMapKeyWordsAtom } from "../../../atoms/atoms";

const SearchInputs = () => {
  const searchMapKeywords = useSearchMapKeyWordsAtom();
  const setSearchKeywords = useSetSearchMapKeyWordsAtom();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  // URLのキーワードパラメータを監視し、初期値として設定
  useEffect(() => {
    const keywordParam = searchParams.get("keyword");
    if (keywordParam) {
      setSearchKeywords(keywordParam);
    }
  }, [searchParams, setSearchKeywords]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams(searchParams.toString());

      if (searchMapKeywords.trim()) {
        params.set("keyword", searchMapKeywords);
      } else {
        params.delete("keyword");
      }

      // URLを更新
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error("検索処理中にエラーが発生しました:", error);
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
        value={searchMapKeywords}
        placeholder="キーワードを入力"
        type="search"
        aria-label="検索キーワード"
        onChange={(e) => setSearchKeywords(e.target.value)}
        disabled={isSearching}
      />

      <Button
        width="30%"
        onClick={handleSearch}
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
