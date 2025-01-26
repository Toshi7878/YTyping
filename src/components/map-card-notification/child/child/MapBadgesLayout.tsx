import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import MapBadge from "@/components/map-card/child/child/MapBadge";
import LikeCountIcon from "@/components/share-components/map-icons/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-icons/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";

interface MapBadgesProps {
  map: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number]["map"];
}

const MapBadges = (props: MapBadgesProps) => {
  const { map } = props;

  return (
    <Flex justifyContent="space-between" width="98%">
      <HStack>
        <CustomToolTip
          label={
            <Box>
              <Box>最高速度:{map.difficulty!.roma_kpm_max}kpm</Box>
            </Box>
          }
          placement="top"
        >
          <MapBadge>
            <Text as="span" fontSize="xs" display={{ base: "none", sm: "inline-block" }}>
              ★
            </Text>
            {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
          </MapBadge>
        </CustomToolTip>
      </HStack>
      <Flex>
        <RankingCountIcon myRank={map.results[0]?.rank} rankingCount={map.ranking_count} />
        <LikeCountIcon
          mapId={map.id}
          isLiked={!!map.map_likes[0]?.is_liked}
          likeCount={map.like_count}
        />
      </Flex>
    </Flex>
  );
};

export default MapBadges;
