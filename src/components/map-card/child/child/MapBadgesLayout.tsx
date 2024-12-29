import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import LikeCountIcon from "@/components/map-icons/LikeCountIcon";
import RankingCountIcon from "@/components/map-icons/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex, HStack, Text, useBreakpointValue } from "@chakra-ui/react";
import MapBadge from "./MapBadge";

interface MapBadgesProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
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
        <RankingCountIcon myRank={map.result[0]?.rank} rankingCount={map.rankingCount} />
        <LikeCountIcon
          mapId={map.id}
          isLiked={!!map.mapLike[0]?.isLiked}
          likeCount={map.likeCount}
        />
      </Flex>
    </Flex>
  );
};

export default MapBadges;
