"use client";

import { useDifficultyRangeAtom, useSetIsSearchingAtom } from "@/app/(home)/atoms/atoms";
import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { PARAM_NAME } from "@/app/(home)/ts/const/consts";
import { MapFilter, PlayFilter } from "@/app/(home)/ts/type";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

const filterParams = [
  {
    name: PARAM_NAME.filter,
    label: "フィルター",
    params: [
      { label: "いいね済", value: "liked" },
      { label: "作成した譜面", value: "my-map" },
    ] as { label: string; value: MapFilter }[],
  },
  {
    name: PARAM_NAME.played,
    label: "ランキング",
    params: [
      { label: "1位", value: "1st" },
      { label: "2位以下", value: "not-first" },
      { label: "登録済", value: "played" },
      { label: "未登録", value: "unplayed" },
      { label: "パーフェクト", value: "perfect" },
    ] as { label: string; value: PlayFilter }[],
  },
];

const FilterInputs = () => {
  const searchParams = useSearchParams();
  const setIsSearchingAtom = useSetIsSearchingAtom();
  const setDifficultyRangeParams = useSetDifficultyRangeParams();
  const difficultyRange = useDifficultyRangeAtom();

  const createQueryString = useCallback(
    (name: string, value: string, isSelected: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!isSelected) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      return setDifficultyRangeParams(params).toString();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, difficultyRange]
  );

  const currentParams = filterParams.map((filterParam) => {
    return {
      name: filterParam.name,
      value: searchParams.get(filterParam.name) || "",
    };
  });

  return (
    <Box
      bg="background.card"
      py={1}
      px={2}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.card60"
      boxShadow="sm"
    >
      <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={1}>
        {filterParams.map((filter, filterIndex) => (
          <React.Fragment key={`filter-${filterIndex}`}>
            <Text
              fontSize="sm"
              fontWeight="medium"
              display="flex"
              alignItems="center"
              color="text.body"
              minWidth={{ base: "auto", md: "80px" }}
              height="32px"
            >
              {filter.label}
            </Text>
            <Flex ml={{ base: 0, md: 3 }} gap={1} alignItems="center" flexWrap="wrap">
              {filter.params.map(
                (param: { label: string; value: MapFilter | PlayFilter }, paramIndex: number) => {
                  const isSelected =
                    currentParams.find((p) => p.name === filter.name)?.value === param.value;

                  return (
                    <Link
                      key={`${filter.name}-${paramIndex}`}
                      href={`?${createQueryString(filter.name, param.value, isSelected)}`}
                      fontSize="sm"
                      fontWeight={isSelected ? "bold" : "normal"}
                      onClick={() => setIsSearchingAtom(true)}
                      color={isSelected ? "secondary.main" : "text.body"}
                      textDecoration={isSelected ? "underline" : "none"}
                      _hover={{
                        color: "secondary.dark",
                        textDecoration: "underline",
                      }}
                      px={2}
                      py={1}
                    >
                      {param.label}
                    </Link>
                  );
                }
              )}
            </Flex>
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default FilterInputs;
