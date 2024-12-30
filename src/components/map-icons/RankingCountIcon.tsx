import { ThemeColors } from "@/types";
import { Box, Flex, useTheme } from "@chakra-ui/react";
import { FaRankingStar } from "react-icons/fa6";
import CustomToolTip from "../custom-ui/CustomToolTip";

interface RankingCountProps {
  myRank: number | undefined;
  rankingCount: number;
}

const RankingCountIcon = (props: RankingCountProps) => {
  const theme: ThemeColors = useTheme();
  const { myRank, rankingCount } = props;

  return (
    <CustomToolTip label={`自分の順位: ${myRank}位`} placement="top" isDisabled={!myRank}>
      <Flex
        alignItems="baseline"
        color={
          myRank === 1
            ? theme.colors.semantic.perfect
            : myRank
            ? theme.colors.secondary.main
            : `${theme.colors.text.body}99`
        }
        mr={1}
      >
        <Box mr={1} position="relative" top="3px">
          <FaRankingStar size={20} />
        </Box>
        <Box fontSize="lg" fontFamily="monospace">
          {rankingCount}
        </Box>
      </Flex>
    </CustomToolTip>
  );
};

export default RankingCountIcon;
