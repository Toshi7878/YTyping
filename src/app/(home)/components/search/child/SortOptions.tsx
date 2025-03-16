"use client";

import { useSetIsSearchingAtom } from "@/app/(home)/atoms/atoms";
import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { PARAM_NAME } from "@/app/(home)/ts/consts";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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
};

const getResetDirections = (): Record<SortField, SortDirection> => ({
  ID: null,
  難易度: null,
  ランキング数: null,
  いいね数: null,
  曲の長さ: null,
  ランダム: null,
});

const SortOptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setIsSearching = useSetIsSearchingAtom();
  const setDifficultyRangeParams = useSetDifficultyRangeParams();

  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>(() => {
    const paramValue = searchParams.get(PARAM_NAME.sort);
    const [direction] = paramValue?.match(/asc|desc/) || ["desc"];
    const [field] = Object.entries(FIELD_TO_PARAMS).find(([_, value]) =>
      paramValue?.includes(value)
    ) || ["ID"];
    return {
      ...getResetDirections(),
      [field as SortField]: direction as SortDirection,
    };
  });

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    let newDirection: SortDirection;

    if (field === "ランダム") {
      newDirection = currentDirection ? null : "desc";
    } else {
      newDirection = currentDirection === null ? "desc" : currentDirection === "desc" ? "asc" : null;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (!newDirection) {
      params.delete(PARAM_NAME.sort);
      setSortDirections({ ...getResetDirections(), ID: "desc" });
    } else if (field === "ランダム") {
      params.set(PARAM_NAME.sort, FIELD_TO_PARAMS[field]);
      setSortDirections({ ...getResetDirections(), ランダム: "desc" });
    } else {
      params.set(PARAM_NAME.sort, `${FIELD_TO_PARAMS[field]}_${newDirection}`);
      setSortDirections({ ...getResetDirections(), [field]: newDirection });
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
    <Flex
      width="100%"
      bg="background.card"
      color="text.body"
      p={2}
      userSelect="none"
      borderRadius="md"
      overflowX="auto"
      flexWrap={{ base: "wrap", md: "nowrap" }}
      justifyContent={{ base: "center", md: "flex-start" }}
      gap={1}
      css={{
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "4px",
        },
      }}
    >
      {Object.keys(FIELD_TO_PARAMS).map((option) => (
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
        >
          <Text mr={1}>{option}</Text>
          {getSortIcon(option as SortField)}
        </Flex>
      ))}
    </Flex>
  );
};

export default SortOptions;
