"use client";

import { Flex, Icon, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

type SortField = "ID" | "難易度" | "ランキング数" | "いいね数" | "曲の長さ" | "ランダム";
type SortDirection = "asc" | "desc" | null;

// フィールド名とURLパラメータ名のマッピング
const fieldToParamMap: Record<SortField, string> = {
  ID: "id",
  難易度: "difficulty",
  ランキング数: "ranking_count",
  いいね数: "like_count",
  曲の長さ: "duration",
  ランダム: "random",
};

const SortOptions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortField, setSortField] = useState<SortField | null>("ID");
  const [sortDirections, setSortDirections] = useState<Record<SortField, SortDirection>>({
    ID: "desc",
    難易度: null,
    ランキング数: null,
    いいね数: null,
    曲の長さ: null,
    ランダム: null,
  });

  const sortOptions: SortField[] = [
    "ID",
    "難易度",
    "ランキング数",
    "いいね数",
    "曲の長さ",
    "ランダム",
  ];

  useEffect(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      // ランダムの場合は特別処理
      if (sortParam === "random") {
        const resetDirections: Record<SortField, SortDirection> = {
          ID: null,
          難易度: null,
          ランキング数: null,
          いいね数: null,
          曲の長さ: null,
          ランダム: "desc", // ランダムをアクティブに
        };
        setSortDirections(resetDirections);
        setSortField("ランダム");
      } else {
        const [field, direction] = sortParam.split("_");
        const matchedField = Object.entries(fieldToParamMap).find(([_, value]) => value === field);

        if (matchedField && (direction === "asc" || direction === "desc")) {
          const fieldKey = matchedField[0] as SortField;
          const resetDirections: Record<SortField, SortDirection> = {
            ID: null,
            難易度: null,
            ランキング数: null,
            いいね数: null,
            曲の長さ: null,
            ランダム: null,
          };

          setSortDirections({
            ...resetDirections,
            [fieldKey]: direction as SortDirection,
          });
          setSortField(fieldKey);
        }
      }
    } else {
      // デフォルトでIDの降順を設定
      const resetDirections: Record<SortField, SortDirection> = {
        ID: "desc",
        難易度: null,
        ランキング数: null,
        いいね数: null,
        曲の長さ: null,
        ランダム: null,
      };
      setSortDirections(resetDirections);
      setSortField("ID");
    }
  }, [searchParams, router]);

  const handleSort = (field: SortField) => {
    const currentDirection = sortDirections[field];
    let newDirection: SortDirection = null;

    // ランダムの場合は方向を切り替えずに常にdescとして扱う
    if (field === "ランダム") {
      newDirection = currentDirection ? null : "desc";
    } else {
      if (currentDirection === null) {
        newDirection = "desc";
      } else if (currentDirection === "desc") {
        newDirection = "asc";
      } else {
        newDirection = null;
      }
    }

    const resetDirections: Record<SortField, SortDirection> = {
      ID: null,
      難易度: null,
      ランキング数: null,
      いいね数: null,
      曲の長さ: null,
      ランダム: null,
    };

    setSortDirections({
      ...resetDirections,
      [field]: newDirection,
    });
    setSortField(newDirection ? field : null);

    // URLパラメータを更新
    const params = new URLSearchParams(searchParams.toString());

    if (newDirection && field) {
      if (field === "ID" && newDirection === "desc") {
        params.delete("sort");
      } else if (field === "ランダム") {
        // ランダムの場合は方向を指定せずにパラメータを設定
        params.set("sort", `${fieldToParamMap[field]}`);
      } else {
        params.set("sort", `${fieldToParamMap[field]}_${newDirection}`);
      }
    } else {
      params.delete("sort");
    }

    router.push(`?${params.toString()}`);
  };

  const getSortIcon = (field: SortField) => {
    // ランダムの場合は専用のアイコンを表示
    if (field === "ランダム") {
      if (sortDirections[field]) {
        return <Icon as={FaSort} />;
      } else {
        return <Icon as={FaSort} visibility="hidden" _groupHover={{ visibility: "visible" }} />;
      }
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
          _hover={{ bg: "button.sub.hover" }}
          transition="all 0.2s"
          role="group"
        >
          <Text mr={1}>{option}</Text>
          {getSortIcon(option)}
        </Flex>
      ))}
    </Flex>
  );
};

export default SortOptions;
