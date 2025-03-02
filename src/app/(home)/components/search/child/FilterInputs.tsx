"use client";

import { MapFilter, PlayFilter } from "@/app/(home)/ts/type";
import { Button, Flex, Stack } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FaHeart, FaMap } from "react-icons/fa6";
import SearchRange from "./child/SearchRange";

const FilterInputs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleFilterClick = (filter: MapFilter) => {
    const currentFilter = searchParams.get("f");
    // 同じフィルターが選択されている場合はフィルターを解除
    const newFilter = currentFilter === filter ? null : filter;
    router.push(`?${createQueryString("f", newFilter)}`);
  };

  const handlePlayedFilterClick = (playFilter: PlayFilter) => {
    const currentFilter = searchParams.get("played");
    const newFilter = currentFilter === playFilter ? null : playFilter;
    router.push(`?${createQueryString("played", newFilter)}`);
  };

  const currentFilter = searchParams.get("f") as MapFilter | null;
  const currentPlayedFilter = searchParams.get("played") as PlayFilter | null;

  return (
    <Flex flexDirection={{ base: "column", md: "row" }} gap={5}>
      <Flex
        gap={5}
        alignItems="baseline"
        width="100%"
        flexDirection={{ base: "column", md: "row" }}
      >
        <SearchRange min={0} max={12} step={0.1} mx={4} />

        <Stack direction="row" gap={2}>
          <Button
            leftIcon={<FaHeart />}
            colorScheme="pink"
            variant={currentFilter === "liked" ? "solid" : "outline"}
            size="sm"
            aria-label="いいね済み"
            onClick={() => handleFilterClick("liked")}
            width={{ base: "100%", md: "auto" }}
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
            width={{ base: "100%", md: "auto" }}
          >
            作成した譜面
          </Button>
        </Stack>
      </Flex>
      <Flex gap={{ base: 2, md: 5 }} alignItems="baseline" width="100%" flexDirection="row">
        <Button
          colorScheme="green"
          variant={currentPlayedFilter === "played" ? "solid" : "outline"}
          size="sm"
          aria-label="プレイ済み"
          onClick={() => handlePlayedFilterClick("played")}
          width={{ base: "100%", md: "auto" }}
        >
          プレイ済み
        </Button>
        <Button
          colorScheme="gray"
          variant={currentPlayedFilter === "unplayed" ? "solid" : "outline"}
          size="sm"
          aria-label="未プレイ"
          onClick={() => handlePlayedFilterClick("unplayed")}
          width={{ base: "100%", md: "auto" }}
        >
          未プレイ
        </Button>
      </Flex>
    </Flex>
  );
};

export default FilterInputs;
