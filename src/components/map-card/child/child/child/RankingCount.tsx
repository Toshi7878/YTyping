import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { Box, Flex, useTheme } from "@chakra-ui/react";
import { FaRankingStar } from "react-icons/fa6";

interface RankingCountProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}

const RankingCount = (props: RankingCountProps) => {
  const theme: ThemeColors = useTheme();
  const { map } = props;
  return (
    <Flex
      alignItems="baseline"
      color={
        map.result[0].rank === 1
          ? theme.colors.semantic.perfect
          : map.result[0].rank
            ? theme.colors.secondary.main
            : `${theme.colors.text.body}99`
      }
      mr={1}
    >
      <Box mr={1} position="relative" top="3px">
        <FaRankingStar size={20} />
      </Box>
      <Box fontSize="lg" fontFamily="monospace">
        {map.rankingCount}
      </Box>
    </Flex>
  );
};

export default RankingCount;
