"use client";
import { useIsSearchingState, useSetIsSearching } from "@/app/timeline/atoms/atoms";
import { useSetSearchParams } from "@/app/timeline/hook/useSetSearchParams";
import { PARAM_NAME } from "@/app/timeline/ts/const/consts";
import { Button, HStack, Input } from "@chakra-ui/react";
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

    // 更新後のパラメータが現在のURLと同じ場合は何もしない
    const updatedParams = rangeParams(params).toString();
    const currentParams = searchParams.toString();

    if (updatedParams === currentParams) {
      return;
    }

    setIsSearching(true);
    router.replace(`?${updatedParams}`);
  };

  return (
    <HStack>
      <Input
        size="md"
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
        size="md"
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
      <Button width="30%" onClick={handleSearch} isLoading={isSearching}>
        検索
      </Button>
    </HStack>
  );
};

export default SearchInputs;
