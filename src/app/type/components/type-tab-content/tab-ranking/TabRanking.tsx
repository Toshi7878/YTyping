import { Box, CardBody, useTheme } from "@chakra-ui/react";

import CustomCard from "@/components/custom-ui/CustomCard";
import { ThemeColors } from "@/types";
import RankingList from "./child/RankingList";

interface TabRankingProps {
  height: string;
}

const TabRanking = (props: TabRankingProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <CustomCard className="tab-card">
      <CardBody fontSize="3xl" fontWeight="bold" width="full" pt={1} pb={2}>
        <Box
          overflowY="scroll"
          minH={props.height}
          maxH={props.height}
          sx={{
            "&::-webkit-scrollbar": {
              width: "12px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: theme.colors.text.header.normal,
              borderRadius: "10px",
              border: "2px solid transparent",
              backgroundClip: "content-box",
            },
          }}
        >
          <RankingList />
        </Box>
      </CardBody>
    </CustomCard>
  );
};

export default TabRanking;
