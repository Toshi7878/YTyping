"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MapCard } from "@/components/shared/map-card/card";
import type { MapListItem } from "@/server/api/routers/map";
import { useTRPC } from "@/trpc/provider";
import { useCreatorIdState } from "../_lib/atoms/hydrate";
import { hasMapUploadPermission } from "../_lib/map-table/has-map-upload-permission";

interface SimilarMapListByVideoIdProps {
  videoId: string;
}

export const SimilarMapListByVideoId = ({ videoId }: SimilarMapListByVideoIdProps) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const creatorId = useCreatorIdState();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  const { data: generatedMapInfo } = useQuery(
    trpc.ai.generateMapInfo.queryOptions(
      { videoId },
      {
        enabled: hasUploadPermission,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
  );

  const title = generatedMapInfo?.originalTitle?.trim() ?? "";

  const { data: maps, isPending } = useQuery(
    trpc.map.list.getByTitle.queryOptions(
      { title },
      {
        enabled: hasUploadPermission && generatedMapInfo && title.length > 0,
        staleTime: Infinity,
      },
    ),
  );

  if (!hasUploadPermission) return null;
  if (title.length === 0) return null;
  if (isPending) return null;
  if (!maps?.length) return null;

  return <SimilarMapList maps={maps} />;
};

const SimilarMapList = ({ maps }: { maps: MapListItem[] }) => {
  return (
    <div className="space-y-3">
      <div className="font-bold text-lg">類似タイトルの譜面が{maps.length}件見つかりました</div>
      <div className="space-y-3">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>
    </div>
  );
};
