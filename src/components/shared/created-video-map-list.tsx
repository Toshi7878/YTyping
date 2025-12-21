"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/provider";
import { Spinner } from "../ui/spinner";
import { MapCard } from "./map-card/card";

interface CreatedVideoMapListProps {
  videoId: string;
  disabledNotFoundText?: boolean;
}

export const CreatedVideoMapList = ({ videoId, disabledNotFoundText = false }: CreatedVideoMapListProps) => {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.mapList.getByVideoId.queryOptions({ videoId }));
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
