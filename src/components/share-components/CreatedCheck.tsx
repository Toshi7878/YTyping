"use client";

import { HOME_THUBNAIL_HEIGHT, HOME_THUBNAIL_WIDTH } from "@/app/(home)/ts/consts";
import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapCard from "@/components/map-card/MapCard";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { useGetCreatedVideoIdMapListQuery } from "@/util/global-hooks/query/mapRouterQuery";
import { Box, Spinner } from "@chakra-ui/react";

interface CreatedCheckProps {
  videoId: string;
  disableNotFoundText?: boolean;
}

const CreatedCheck = ({ videoId, disableNotFoundText = false }: CreatedCheckProps) => {
  const { data, isPending } = useGetCreatedVideoIdMapListQuery({ videoId });

  if (isPending) {
    return <Spinner size="sm" my={10} />;
  }

  if (data && data.length) {
    return (
      <Box>
        <Box fontSize="lg" fontWeight="bold" my={3}>
          この動画の譜面が{data.length}件見つかりました
        </Box>
        {data.map((map, index) => {
          const src =
            map.thumbnail_quality === "maxresdefault"
              ? `https://i.ytimg.com/vi_webp/${map.video_id}/maxresdefault.webp`
              : `https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`;

          return (
            <Box key={index} mb={2} maxW="610px">
              <MapCard>
                <MapLeftThumbnail
                  alt={map.title}
                  fallbackSrc={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                  src={src}
                  mapVideoId={map.video_id}
                  mapPreviewTime={map.preview_time}
                  thumbnailQuality={map.thumbnail_quality}
                  thumnailWidth={HOME_THUBNAIL_WIDTH}
                  thumnailHeight={HOME_THUBNAIL_HEIGHT}
                />
                <MapCardRightInfo>
                  <MapInfo map={map} />
                </MapCardRightInfo>
              </MapCard>
            </Box>
          );
        })}
      </Box>
    );
  } else if (!disableNotFoundText) {
    return (
      <Box fontSize="lg" fontWeight="bold" my={3}>
        この動画の譜面は見つかりませんでした
      </Box>
    );
  }
  return null;
};

export default CreatedCheck;
