import { Box, useTheme } from "@chakra-ui/react";
import React from "react";
import ResultBadge from "./child/ResultBadge";
import { ThemeColors } from "@/types";

interface UserRankProps {
  userRank: number;
}

const UserRank = ({ userRank }: UserRankProps) => {
  const theme: ThemeColors = useTheme();

  const rankColor = userRank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <Box fontSize="lg" fontWeight="bold" pl={5} pr={1} whiteSpace="nowrap" m={"auto"}>
      <ResultBadge color={rankColor} borderColor={rankColor}>
        Rank: #{userRank}
      </ResultBadge>
    </Box>
  );
};

export default UserRank;
