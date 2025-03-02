"use client";

import { Flex, Icon, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

type SortField = "タイトル" | "アーティスト" | "難易度" | "ランキング数" | "いいね数";
type SortDirection = "asc" | "desc" | null;

// フィールド名とURLパラメータ名のマッピング
const fieldToParamMap: Record<SortField, string> = {
  タイトル: "title",
  アーティスト: "artist",
  難易度: "difficulty",
  ランキング数: "ranking_count",
  いいね数: "like_count",
};

const SortOptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>({
    タイトル: null,
    アーティスト: null,
    難易度: null,
    ランキング数: null,
    いいね数: null,
  });

  const sortOptions: SortField[] = [
    "タイトル",
    "アーティスト",
    "難易度",
    "ランキング数",
    "いいね数",
  ];

  useEffect(() => {
    // URLからソート状態を初期化
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      const [field, direction] = sortParam.split("_");
      const matchedField = Object.entries(fieldToParamMap).find(([_, value]) => value === field);

      if (matchedField && (direction === "asc" || direction === "desc")) {
        const fieldKey = matchedField[0] as SortField;
        const resetDirections: Record<SortField, SortDirection> = {
          タイトル: null,
          アーティスト: null,
          難易度: null,
          ランキング数: null,
          いいね数: null,
        };

        setSortDirections({
          ...resetDirections,
          [fieldKey]: direction as SortDirection,
        });
        setSortField(fieldKey);
      }
    }
  }, [searchParams]);

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    let newDirection: SortDirection = null;

    if (currentDirection === null) {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = "asc";
    } else {
      newDirection = null;
    }

    const resetDirections: Record<SortField, SortDirection> = {
      タイトル: null,
      アーティスト: null,
      難易度: null,
      ランキング数: null,
      いいね数: null,
    };

    setSortDirections({
      ...resetDirections,
      [field]: newDirection,
    });
    setSortField(newDirection ? field : null);

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());

    if (newDirection && field) {
      params.set("sort", `${fieldToParamMap[field]}_${newDirection}`);
    } else {
      params.delete("sort");
    }

    router.push(`?${params.toString()}`);
  };

  const getSortIcon = (field: SortField) => {
    const direction = sortDirections[field];
    if (direction === "asc") return <Icon as={FaSortUp} />;
    if (direction === "desc") return <Icon as={FaSortDown} />;
    return <Icon as={FaSort} color="gray.400" />;
  };

  return (
    <Flex
      width="100%"
      bg="gray.800"
      color="white"
      p={2}
      borderRadius="md"
      overflowX="auto"
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
          onClick={() => handleSort(option)}
          _hover={{ bg: "gray.700" }}
          transition="all 0.2s"
        >
          <Text mr={1}>{option}</Text>
          {getSortIcon(option)}
        </Flex>
      ))}
    </Flex>
  );
};

export default SortOptions;
