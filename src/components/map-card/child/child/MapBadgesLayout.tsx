import { MapCardInfo } from "@/app/(home)/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Box, Flex, HStack, Text, useBreakpointValue } from "@chakra-ui/react";
import React from "react";
import MapBadge from "./MapBadge";
import LikeCount from "./child/LikeCount";
import RankingCount from "./child/RankingCount";

interface MapBadgesProps {
  map: MapCardInfo;
}

const MapBadges = (props: MapBadgesProps) => {
  const { map } = props;
  const showBadges = useBreakpointValue({ base: false, md: true }, { ssr: false });

  return (
    <Flex
      justifyContent={{ base: "flex-end", md: "space-between" }}
      width={{ base: "fit-content", lg: "98%" }}
      mr={3}
    >
      <HStack mr={2}>
        <CustomToolTip
          tooltipLabel={
            <Box>
              <Box>最高速度:{map.romaKpmMax}kpm</Box>
            </Box>
          }
          placement="top"
        >
          <MapBadge>
            <Text as="span" fontSize="xs" display={{ base: "none", sm: "inline-block" }}>
              ★
            </Text>
            {(map.romaKpmMedian / 100).toFixed(1)}
          </MapBadge>
        </CustomToolTip>
        {showBadges && (
          <MapBadge>{new Date(map.totalTime * 1000).toISOString().slice(14, 19)}</MapBadge>
        )}
      </HStack>
      <Flex>
        <RankingCount map={map} />
        <LikeCount map={map} />
      </Flex>
    </Flex>
  );
};

export default MapBadges;
