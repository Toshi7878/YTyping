"use client";

import { Button, Flex } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FaHeart, FaMap } from "react-icons/fa6";
import SearchRange from "./child/SearchRange";

const FilterInputs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (filter: MapFilter | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filter) {
        params.set("f", filter);
      } else {
        params.delete("f");
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleFilterClick = (filter: MapFilter) => {
    const currentFilter = searchParams.get("f");
    // 同じフィルターが選択されている場合はフィルターを解除
    const newFilter = currentFilter === filter ? null : filter;
    router.push(`?${createQueryString(newFilter)}`);
  };

  const currentFilter = searchParams.get("f") as MapFilter | null;

  return (
    <Flex gap={5} alignItems="baseline" width="100%">
      <SearchRange min={0} max={15} step={0.1} mx={4} />

      <Button
        leftIcon={<FaHeart />}
        colorScheme="pink"
        variant={currentFilter === "liked" ? "solid" : "outline"}
        size="sm"
        aria-label="いいね済み"
        onClick={() => handleFilterClick("liked")}
      >
        いいね済み
      </Button>
      <Button
        leftIcon={<FaMap />}
        colorScheme="teal"
        variant={currentFilter === "my-map" ? "solid" : "outline"}
        size="sm"
        aria-label="マイマップ"
        onClick={() => handleFilterClick("my-map")}
      >
        作成した譜面
      </Button>
    </Flex>
  );
};

export default FilterInputs;
