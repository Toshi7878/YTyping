"use client";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { MapCard } from "@/shared/map/list/card/base";
import { hasMapUploadPermission } from "./permission/has-permission";
import { useCreatorId } from "./provider";

interface SimilarMapListByVideoIdProps {
  videoId: string;
}

export const SimilarMapListByVideoId = ({ videoId }: SimilarMapListByVideoIdProps) => {
  const t = useTranslations("editorLine");
  const { data: session } = useSession();
  const creatorId = useCreatorId();
  const hasUploadPermission = hasMapUploadPermission(session, creatorId);

  const { data: generatedMapInfo } = useQuery(
    orpc.ai.generateMapInfo.queryOptions({
      input: { videoId },
      enabled: hasUploadPermission,
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  const title = generatedMapInfo?.originalTitle?.trim() ?? "";

  const { data: maps, isPending } = useQuery(
    orpc.map.list.getByTitle.queryOptions({
      input: { title },
      enabled: hasUploadPermission && generatedMapInfo && title.length > 0,
      staleTime: Infinity,
    }),
  );

  if (!hasUploadPermission) return null;
  if (title.length === 0) return null;
  if (isPending) return null;
  if (!maps?.length) return null;

  return (
    <div className="space-y-3">
      <div className="font-bold text-lg">{t("similar", { count: maps.length })}</div>
      <div className="space-y-3">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </div>
    </div>
  );
};
