"use client";

import MapInfo from "@/components/shared/map-info/MapInfo";
import MapLeftThumbnail from "@/components/shared/MapCardThumbnail";
import { useMapListQueryOptions } from "@/utils/queries/mapList.queries";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CardWithContent } from "../ui/card";

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
              <CardWithContent variant="map">
                <MapLeftThumbnail
                  alt={map.title}
                  src={`https://i.ytimg.com/vi/${map.videoId}/mqdefault.jpg`}
                  mapVideoId={map.videoId}
                  mapPreviewTime={map.previewTime}
                  size="home"
                />

                <MapInfo map={map} />
              </CardWithContent>
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
