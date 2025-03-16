"use client";

import { useDifficultyRangeAtom, useSetIsSearchingAtom } from "@/app/(home)/atoms/atoms";
import { useSetDifficultyRangeParams } from "@/app/(home)/hook/useSetDifficultyRangeParams";
import { MY_FILTER, PLAYED_FILTER } from "@/app/(home)/ts/consts";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import React, { useCallback } from "react";

const FILTER_CONTENT = [MY_FILTER, PLAYED_FILTER];
type FilterParam = (typeof FILTER_CONTENT)[number]["params"][number];

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

  const currentParams = FILTER_CONTENT.map((filterParam) => {
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
        {FILTER_CONTENT.map((filter, filterIndex) => (
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
              {filter.params.map((param: FilterParam, paramIndex: number) => {
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
              })}
            </Flex>
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default FilterInputs;
