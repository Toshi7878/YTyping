"use client";

import { useSetIsSearchingAtom } from "@/app/(home)/atoms/atoms";
import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { PARAM_NAME } from "@/app/(home)/ts/const/consts";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

type SortField = "ID" | "難易度" | "ランキング数" | "いいね数" | "曲の長さ" | "ランダム";
type SortDirection = "asc" | "desc" | null;

const fieldToParamMap: Record<SortField, string> = {
  ID: "id",
  難易度: "difficulty",
  ランキング数: "ranking_count",
  いいね数: "like_count",
  曲の長さ: "duration",
  ランダム: "random",
};

const sortOptions: SortField[] = [
  "ID",
  "難易度",
  "ランキング数",
  "いいね数",
  "曲の長さ",
  "ランダム",
];

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

  const [sortField, setSortField] = useState<SortField | null>("ID");
  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>({
    ...getResetDirections(),
    ID: "desc",
  });

  useEffect(() => {
    const sortParam = searchParams.get(PARAM_NAME.sort);
    const resetDirections = getResetDirections();

    if (!sortParam) {
      setSortDirections({ ...resetDirections, ID: "desc" });
      setSortField("ID");
      return;
    }

    if (sortParam === "random") {
      setSortDirections({ ...resetDirections, ランダム: "desc" });
      setSortField("ランダム");
      return;
    }

    const [field, direction] = sortParam.split("_");
    const matchedField = Object.entries(fieldToParamMap).find(([_, value]) => value === field);

    if (matchedField && (direction === "asc" || direction === "desc")) {
      const fieldKey = matchedField[0] as SortField;
      setSortDirections({
        ...resetDirections,
        [fieldKey]: direction as SortDirection,
      });
      setSortField(fieldKey);
    }
  }, [searchParams]);

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    let newDirection: SortDirection;

    if (field === "ランダム") {
      newDirection = currentDirection ? null : "desc";
    } else {
      newDirection =
        currentDirection === null ? "desc" : currentDirection === "desc" ? "asc" : null;
    }

    setSortDirections({
      ...getResetDirections(),
      [field]: newDirection,
    });
    setSortField(newDirection ? field : null);

    const params = new URLSearchParams(searchParams.toString());

    if (!newDirection || (field === "ID" && newDirection === "desc")) {
      params.delete(PARAM_NAME.sort);
    } else if (field === "ランダム") {
      params.set(PARAM_NAME.sort, fieldToParamMap[field]);
    } else {
      params.set(PARAM_NAME.sort, `${fieldToParamMap[field]}_${newDirection}`);
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
      {sortOptions.map((option) => (
        <Flex
          key={option}
          alignItems="center"
          justifyContent="center"
          px={3}
          py={1}
          cursor="pointer"
          fontWeight={sortField === option ? "bold" : "normal"}
          color={sortField === option ? "secondary.light" : "normal"}
          onClick={() => handleSort(option)}
          _hover={{ bg: "button.sub.hover" }}
          transition="all 0.2s"
          role="group"
          minWidth={{ base: "auto", md: "auto" }}
          flex={{ base: "0 0 auto", md: "0 0 auto" }}
        >
          <Text mr={1}>{option}</Text>
          {getSortIcon(option)}
        </Flex>
      ))}
    </Flex>
  );
};

export default SortOptions;
