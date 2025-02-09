import { TIMELINE_THUBNAIL_HEIGHT, TIMELINE_THUBNAIL_WIDTH } from "@/app/timeline/ts/const/consts";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import LikeCountIcon from "@/components/share-components/map-icons/LikeCountIcon";
import RankingCountIcon from "@/components/share-components/map-icons/RankingCountIcon";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { Flex, FlexProps } from "@chakra-ui/react";
import MapInfo from "./child/MapInfo";
import { MapResultBadges } from "./child/MapResultBadgesLayout";
import UserRank from "./child/UserRank";

interface ResultInnerCardBodyProps {
  result?: ResultCardInfo;
}
const ResultInnerCardBody = (props: ResultInnerCardBodyProps) => {
  const { result } = props;

  const isToggledInputMode = result?.status.roma_type != 0 && result?.status.kana_type != 0;

  const rowDisplay = { base: "none", md: "flex" };
  const columnDisplay = { base: "flex", md: "none" };
  return (
    <>
      {result && <MapIcons result={result} bottom="25px" left="35px" display={rowDisplay} />}
      <Flex
        minW="100%"
        py={6}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        zIndex={0}
      >
        <Flex direction="row" gap={4} width="100%">
          {result && <UserRank userRank={result.rank} display={rowDisplay} />}

          <MapLeftThumbnail
            alt={result ? result.map.title : ""}
            fallbackSrc={
              result ? `https://i.ytimg.com/vi/${result.map.video_id}/mqdefault.jpg` : ""
            }
            mapVideoId={result?.map.video_id}
            mapPreviewTime={result?.map.preview_time}
            mapPreviewSpeed={result?.status.default_speed}
            thumnailWidth={TIMELINE_THUBNAIL_WIDTH}
            thumnailHeight={TIMELINE_THUBNAIL_HEIGHT}
          />

          {result && (
            <MapInfo
              map={result.map}
              isToggledInputMode={isToggledInputMode}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            />
          )}

          {result && (
            <MapIcons result={result} top={"142px"} right={"30px"} display={columnDisplay} />
          )}
          <Flex ml="auto" justifyContent="flex-end" display={rowDisplay}>
            <MapResultBadges result={result} />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

interface MapIconsProps {
  result: ResultCardInfo;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}
const MapIcons = ({
  result,
  top = "auto",
  right = "auto",
  bottom = "auto",
  left = "auto",
  ...rest
}: MapIconsProps & FlexProps) => {
  return (
    <Flex
      zIndex={2}
      position="absolute"
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      {...rest}
    >
      <RankingCountIcon
        myRank={result.map.results[0]?.rank}
        rankingCount={result.map.ranking_count}
      />
      <LikeCountIcon
        mapId={result.map.id}
        isLiked={!!result.map.map_likes[0]?.is_liked}
        likeCount={result.map.like_count}
      />
    </Flex>
  );
};

export default ResultInnerCardBody;
