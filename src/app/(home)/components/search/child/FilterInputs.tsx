"use client";

import { MapFilter, PlayFilter } from "@/app/(home)/ts/type";
import { Badge, Button, Flex, Stack, Text } from "@chakra-ui/react";
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
    <Flex flexDirection={{ base: "column", md: "row" }} alignItems="baseline" gap={5}>
      <Flex
        gap={5}
        alignItems="baseline"
        width="100%"
        flexDirection={{ base: "column", md: "row" }}
      >
        <SearchRange step={0.1} mx={4} />

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
      <Stack
        direction="row"
        spacing={{ base: 2, md: 4 }}
        align="center"
        width="100%"
        bg="background.card"
        p={2.5}
        borderRadius="md"
        boxShadow="sm"
      >
        <Text fontWeight="medium" color="text.body">
          ランキング:
        </Text>
        <Badge
          as="button"
          variant={currentPlayedFilter === "played" ? "filterSolid" : "filterOutline"}
          onClick={() => handlePlayedFilterClick("played")}
        >
          登録済
        </Badge>
        <Badge
          as="button"
          variant={currentPlayedFilter === "unplayed" ? "filterSolid" : "filterOutline"}
          onClick={() => handlePlayedFilterClick("unplayed")}
        >
          未登録
        </Badge>
      </Stack>
    </Flex>
  );
};

export default FilterInputs;
