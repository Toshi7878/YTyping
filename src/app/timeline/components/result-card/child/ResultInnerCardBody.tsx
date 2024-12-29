import { TIMELINE_THUBNAIL_HEIGHT, TIMELINE_THUBNAIL_WIDTH } from "@/app/timeline/ts/const/consts";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import MapLeftThumbnail from "@/components/map-card/child/MapCardLeftThumbnail";
import { ThemeColors } from "@/types";
import { CardBody, Flex, useBreakpointValue, useTheme } from "@chakra-ui/react";
import LikeCount from "./child/icon-child/LikeCount";
import RankingCount from "./child/icon-child/RankingCount";
import MapInfo from "./child/MapInfo";
import { MapResultBadges } from "./child/MapResultBadgesLayout";
import UserRank from "./child/UserRank";

interface ResultInnerCardBodyProps {
  result: ResultCardInfo;
}
const ResultInnerCardBody = (props: ResultInnerCardBodyProps) => {
  const { result } = props;
  const theme: ThemeColors = useTheme();

  const src =
    result.map.thumbnailQuality === "maxresdefault"
      ? `https://i.ytimg.com/vi_webp/${result.map.videoId}/maxresdefault.webp`
      : `https://i.ytimg.com/vi/${result.map.videoId}/mqdefault.jpg`;

  const isToggledInputMode = result.romaType != 0 && result.kanaType != 0;
  const isRowDisplay = useBreakpointValue({ base: false, md: true }, { ssr: false });

  return (
    <CardBody
      color={"color"}
      bgImage={`linear-gradient(to right,  ${theme.colors.background.body}, ${theme.colors.background.body}dd), url(${src})`} // 画像のみに黒いオーバーレイを追加
      bgSize="cover"
      bgPosition="center" // 画像の位置を20px下に調整
      borderRadius="lg"
      className="flex items-start"
      style={{ padding: 0, border: "none" }}
      mx={6}
    >
      {isRowDisplay && <MapIcons result={result} bottom="25px" left="35px" />}
      <Flex
        py={6}
        direction="row"
        gap={4}
        justifyContent="space-between"
        w="100%"
        alignItems="center"
        zIndex={0}
      >
        <Flex direction="row" gap={4}>
          {isRowDisplay && <UserRank userRank={result.rank} />}
          <MapLeftThumbnail
            alt={result.map.title}
            src={src}
            fallbackSrc={`https://i.ytimg.com/vi/${result.map.videoId}/mqdefault.jpg`}
            mapVideoId={result.map.videoId}
            mapPreviewTime={result.map.previewTime}
            mapPreviewSpeed={result.defaultSpeed}
            thumbnailQuality={result.map.thumbnailQuality}
            thumnailWidth={TIMELINE_THUBNAIL_WIDTH}
            thumnailHeight={TIMELINE_THUBNAIL_HEIGHT}
          />
          <MapInfo map={result.map} isToggledInputMode={isToggledInputMode} />
          {!isRowDisplay && <MapIcons result={result} top={"142px"} right={"30px"} />}
        </Flex>
        {isRowDisplay && (
          <Flex justifyContent="flex-end">
            <MapResultBadges props={result} />
          </Flex>
        )}
      </Flex>
    </CardBody>
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
    <Flex position="absolute" top={top} right={right} bottom={bottom} left={left} zIndex="10">
      <RankingCount myRank={result.result[0]?.rank} rankingCount={result.map.rankingCount} />
      <LikeCount
        mapId={result.map.id}
        isLiked={!!result.mapLike[0]?.isLiked}
        likeCount={result.map.likeCount}
      />
    </Flex>
  );
};

export default ResultInnerCardBody;
