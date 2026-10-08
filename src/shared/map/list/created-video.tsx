"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/provider";
import { MapCard } from "@/shared/map/list/card/base";
import { Spinner } from "@/ui/spinner";

interface CreatedMapListByVideoIdProps {
  videoId: string;
  disabledNotFoundText?: boolean;
}

export const CreatedMapListByVideoId = ({ videoId, disabledNotFoundText = false }: CreatedMapListByVideoIdProps) => {
  const { data, isPending } = useQuery(orpc.map.list.getByVideoId.queryOptions({ input: { videoId } }));
  if (isPending) return <Spinner />;

  if (data?.length) {
    return (
      <div className="space-y-3">
        <div className="font-bold text-lg">この動画の譜面が{data.length}件見つかりました</div>
        <div className="space-y-3">
          {data.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      </div>
    );
  }

  if (!disabledNotFoundText) {
    return <div className="my-3 font-bold text-lg">この動画の譜面は見つかりませんでした</div>;
  }

  return null;
};
