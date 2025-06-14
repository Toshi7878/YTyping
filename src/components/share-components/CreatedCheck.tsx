"use client";

import MapInfo from "@/components/map-card/child/child/MapInfo";
import MapCardRightInfo from "@/components/map-card/child/MapCardRightInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import { useMapListQueryOptions } from "@/utils/queries/mapList.queries";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface CreatedCheckProps {
  videoId: string;
  disableNotFoundText?: boolean;
}

const CreatedCheck = ({ videoId, disableNotFoundText = false }: CreatedCheckProps) => {
  const { data, isPending } = useQuery(useMapListQueryOptions().listByVideoId({ videoId }));

  if (isPending) {
    return (
      <div className="my-10 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (data && data.length) {
    return (
      <div>
        <div className="my-3 text-lg font-bold">この動画の譜面が{data.length}件見つかりました</div>
        {data.map((map, index) => {
          return (
            <div key={index} className="mb-2 max-w-[610px]">
              <Card variant="map">
                <CardContent variant="map">
                  <MapLeftThumbnail
                    alt={map.title}
                    src={`https://i.ytimg.com/vi/${map.video_id}/mqdefault.jpg`}
                    mapVideoId={map.video_id}
                    mapPreviewTime={map.preview_time}
                    size="home"
                  />
                  <MapCardRightInfo>
                    <MapInfo map={map} />
                  </MapCardRightInfo>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  } else if (!disableNotFoundText) {
    return <div className="my-3 text-lg font-bold">この動画の譜面は見つかりませんでした</div>;
  }
  return null;
};

export default CreatedCheck;
