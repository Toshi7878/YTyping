import LikeCountIcon from "@/components/share-components/map-count-icon/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-count-icon/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";
import { formatTime } from "@/util/formatTime";
import { Flex, HStack, Text } from "@chakra-ui/react";
import MapBadge from "./MapBadge";

interface MapBadgesProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}

const MapBadges = (props: MapBadgesProps) => {
  const { map } = props;

  return (
    <Flex justifyContent={{ base: "flex-end", md: "space-between" }} width={{ base: "fit-content", lg: "98%" }} mr={3}>
      <HStack mr={2}>
        <MapBadge>
          <Text as="span" fontSize="xs" display={{ base: "none", sm: "inline-block" }}>
            ★
          </Text>
          {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
        </MapBadge>
        <MapBadge display={{ base: "none", md: "block" }}>{formatTime(map.difficulty!.total_time)}</MapBadge>
      </HStack>
      <Flex>
        <RankingCountIcon key={map.results[0]?.rank} myRank={map.results[0]?.rank} rankingCount={map.ranking_count} />
        <LikeCountIcon mapId={map.id} isLiked={!!map.map_likes[0]?.is_liked} likeCount={map.like_count} />
      </Flex>
    </Flex>
  );
};

export default MapBadges;
