"use client";

import { useSetIsSearching } from "@/app/(home)/atoms/atoms";
import { useDifficultyRangeParams } from "@/app/(home)/hook/useDifficultyRangeParams";
import { PARAM_NAME } from "@/app/(home)/ts/consts";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

type SortField = keyof typeof FIELD_TO_PARAMS;
type SortDirection = "asc" | "desc" | null;

const FIELD_TO_PARAMS = {
  ID: "id" as const,
  難易度: "difficulty" as const,
  ランキング数: "ranking_count" as const,
  いいね数: "like_count" as const,
  曲の長さ: "duration" as const,
  ランダム: "random" as const,
  いいね: "like" as const,
};

const getResetDirections = (): Record<SortField, SortDirection> => ({
  ID: null,
  難易度: null,
  ランキング数: null,
  いいね数: null,
  曲の長さ: null,
  ランダム: null,
  いいね: null,
});

const SortOptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setIsSearching = useSetIsSearching();
  const setDifficultyRangeParams = useDifficultyRangeParams();

  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>(() => {
    const paramValue = searchParams.get(PARAM_NAME.sort);
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const [field] = Object.entries(FIELD_TO_PARAMS).find(([_, value]) => paramValue?.includes(value)) || ["ID"];
    return {
      ...getResetDirections(),
      [field as SortField]: direction as SortDirection,
    };
  });

  useEffect(() => {
    const paramValue = searchParams.get(PARAM_NAME.sort);
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const [field] = Object.entries(FIELD_TO_PARAMS).find(([_, value]) => paramValue?.includes(value)) || ["ID"];
    setSortDirections({ ...getResetDirections(), [field as SortField]: direction as SortDirection });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    const params = new URLSearchParams(searchParams.toString());

    if (currentDirection === null) {
      if (field === "ID") {
        params.delete(PARAM_NAME.sort);
      } else if (field === "ランダム") {
        params.set(PARAM_NAME.sort, "random");
      } else {
        params.set(PARAM_NAME.sort, `${FIELD_TO_PARAMS[field]}_desc`);
      }
      setSortDirections({ ...getResetDirections(), [field]: "desc" });
    } else if (currentDirection === "desc" && field !== "ランダム") {
      params.set(PARAM_NAME.sort, `${FIELD_TO_PARAMS[field]}_asc`);
      setSortDirections({ ...getResetDirections(), [field]: "asc" });
    } else {
      params.delete(PARAM_NAME.sort);
      setSortDirections({ ...getResetDirections(), ID: "desc" });
    }

    setIsSearching(true);
    router.push(`?${setDifficultyRangeParams(params).toString()}`);
  };

  const getSortIcon = (field: SortField) => {
    if (field === "ランダム") {
      return (
        <Icon
          as={FaSort}
          visibility={sortDirections[field] ? "visible" : "hidden"}
          _groupHover={{ visibility: "visible" }}
        />
      );
    }

    const direction = sortDirections[field];
    if (direction === "asc") return <Icon as={FaSortUp} />;
    if (direction === "desc") return <Icon as={FaSortDown} />;
    return <Icon as={FaSortDown} visibility="hidden" _groupHover={{ visibility: "visible" }} />;
  };

  return (
    <Flex userSelect="none">
      {Object.keys(FIELD_TO_PARAMS).map((option) => {
        const isLikedSort = option === "いいね";
        const isFilterLiked = searchParams.get("filter") === "liked";
        if (isLikedSort && !isFilterLiked) {
          return null;
        }
        return (
          <Flex
            key={option}
            alignItems="center"
            justifyContent="center"
            px={3}
            py={1}
            cursor="pointer"
            fontWeight={sortDirections[option as SortField] ? "bold" : "normal"}
            color={sortDirections[option as SortField] ? "secondary.light" : "normal"}
            onClick={() => handleSort(option as SortField)}
            _hover={{ bg: "button.sub.hover" }}
            transition="all 0.2s"
            role="group"
            minWidth={{ base: "auto", md: "auto" }}
            flex={{ base: "0 0 auto", md: "0 0 auto" }}
            borderRadius="md"
            bg={sortDirections[option as SortField] ? "rgba(255, 255, 255, 0.1)" : "transparent"}
          >
            <Text mr={1}>{option}</Text>
            {getSortIcon(option as SortField)}
          </Flex>
        );
      })}
    </Flex>
  );
};

export default SortOptions;
