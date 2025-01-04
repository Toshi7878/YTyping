import { TIMELINE_THUBNAIL_HEIGHT, TIMELINE_THUBNAIL_WIDTH } from "@/app/timeline/ts/const/consts";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import MapLeftThumbnail from "@/components/map-card/child/MapCardLeftThumbnail";
import { Flex, useBreakpointValue } from "@chakra-ui/react";
import LikeCountIcon from "../../../../../components/map-icons/LikeCountIcon";
import RankingCountIcon from "../../../../../components/map-icons/RankingCountIcon";
import MapInfo from "./child/MapInfo";
import { MapResultBadges } from "./child/MapResultBadgesLayout";
import UserRank from "./child/UserRank";

interface ResultInnerCardBodyProps {
  result?: ResultCardInfo;
}
const ResultInnerCardBody = (props: ResultInnerCardBodyProps) => {
  const { result } = props;

  const src =
    result?.map.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result?.map.videoId}/mqdefault.jpg`;

  const isToggledInputMode = result?.romaType != 0 && result?.kanaType != 0;
  const isRowDisplay = useBreakpointValue({ base: false, md: true }, { ssr: false });

  return (
    <>
      {isRowDisplay && result && <MapIcons result={result} bottom="25px" left="35px" />}
      <Flex
        minW="100%"
        py={6}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        zIndex={0}
      >
        <Flex direction="row" gap={4} width="100%">
          {isRowDisplay && result && <UserRank userRank={result.rank} />}

          <MapLeftThumbnail
            alt={result ? result.map.title : ""}
            fallbackSrc={result ? `https://i.ytimg.com/vi/${result.map.videoId}/mqdefault.jpg` : ""}
            mapVideoId={result?.map.videoId}
            mapPreviewTime={result?.map.previewTime}
            mapPreviewSpeed={result?.defaultSpeed}
            thumnailWidth={TIMELINE_THUBNAIL_WIDTH}
            thumnailHeight={TIMELINE_THUBNAIL_HEIGHT}
          />

          {result && (
            <MapInfo
              map={result.map}
              isToggledInputMode={isToggledInputMode}
              w={
                isRowDisplay
                  ? {
                      base: "15vw",
                      lg: isToggledInputMode ? "15vw" : "18vw",
                      "2xl": isToggledInputMode ? "18vw" : "21vw",
                    }
                  : "100%"
              }
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            />
          )}

          {!isRowDisplay && result && <MapIcons result={result} top={"142px"} right={"30px"} />}
        </Flex>
        {isRowDisplay && (
          <Flex justifyContent="flex-end" minW="fit-content">
            <MapResultBadges result={result} />
          </Flex>
        )}
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
}: MapIconsProps) => {
  return (
    <Flex zIndex={2} position="absolute" top={top} right={right} bottom={bottom} left={left}>
      <RankingCountIcon myRank={result.result[0]?.rank} rankingCount={result.map.rankingCount} />
      <LikeCountIcon
        mapId={result.map.id}
        isLiked={!!result.mapLike[0]?.isLiked}
        likeCount={result.map.likeCount}
      />
    </Flex>
  );
};

export default ResultInnerCardBody;
