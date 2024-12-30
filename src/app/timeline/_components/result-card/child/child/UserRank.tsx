import { ThemeColors } from "@/types";
import { Box, BoxProps, useTheme } from "@chakra-ui/react";
import ResultBadge from "./child/ResultBadge";

interface UserRankProps extends BoxProps {
  userRank: number;
}

const UserRank = ({ userRank, ...rest }: UserRankProps) => {
  const theme: ThemeColors = useTheme();

  const rankColor = userRank === 1 ? theme.colors.semantic.perfect : theme.colors.text.body;
  return (
    <Box fontSize="lg" fontWeight="bold" my="auto" ml={4} {...rest}>
      <ResultBadge color={rankColor} borderColor={rankColor}>
        Rank: #{userRank}
      </ResultBadge>
    </Box>
  );
};

export default UserRank;
