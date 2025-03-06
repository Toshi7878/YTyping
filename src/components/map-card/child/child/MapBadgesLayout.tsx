import LikeCountIcon from "@/components/share-components/map-icons/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-icons/RankingCountIcon";
import { RouterOutPuts } from "@/server/api/trpc";
import { Flex, HStack, Text } from "@chakra-ui/react";
import MapBadge from "./MapBadge";

interface MapBadgesProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}

const MapBadges = (props: MapBadgesProps) => {
  const { map } = props;

  return (
    <Flex
      justifyContent={{ base: "flex-end", md: "space-between" }}
      width={{ base: "fit-content", lg: "98%" }}
      mr={3}
    >
      <HStack mr={2}>
        <MapBadge>
          <Text as="span" fontSize="xs" display={{ base: "none", sm: "inline-block" }}>
            ★
          </Text>
          {(map.difficulty!.roma_kpm_median / 100).toFixed(1)}
        </MapBadge>
        <MapBadge display={{ base: "none", md: "block" }}>
          {new Date(map.difficulty!.total_time * 1000)
            .toISOString()
            .slice(11, 19)
            .replace(/^00:/, "")}
        </MapBadge>
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
