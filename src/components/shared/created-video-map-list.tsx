"use client";

import MapInfo from "@/components/shared/map-info/MapInfo";
import MapLeftThumbnail from "@/components/shared/MapCardThumbnail";
import { useTRPC } from "@/trpc/provider";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { CardWithContent } from "../ui/card";

interface CreatedVideoMapListProps {
  videoId: string;
  disabledNotFoundText?: boolean;
}

const CreatedVideoMapList = ({ videoId, disabledNotFoundText = false }: CreatedVideoMapListProps) => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.mapList.getByVideoId.queryOptions({ videoId }));

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
                <MapLeftThumbnail alt={map.info.title} media={map.media} size="home" />

                <MapInfo map={map} />
              </CardWithContent>
            </div>
          );
        })}
      </div>
    );
  } else if (!disabledNotFoundText) {
    return <div className="my-3 text-lg font-bold">この動画の譜面は見つかりませんでした</div>;
  }
  return null;
};

export default CreatedVideoMapList;
