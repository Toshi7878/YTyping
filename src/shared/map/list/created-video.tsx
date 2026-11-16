"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { MapCard } from "@/shared/map/list/card/base";
import { Spinner } from "@/ui/spinner";

interface CreatedMapListByVideoIdProps {
  videoId: string;
  disabledNotFoundText?: boolean;
}

export const CreatedMapListByVideoId = ({ videoId, disabledNotFoundText = false }: CreatedMapListByVideoIdProps) => {
  const t = useTranslations("map.createdVideo");
  const { data, isPending } = useQuery(orpc.map.list.getByVideoId.queryOptions({ input: { videoId } }));
  if (isPending) return <Spinner />;

  if (data?.length) {
    return (
      <div className="space-y-3">
        <div className="font-bold text-lg">{t("found", { count: data.length })}</div>
        <div className="space-y-3">
          {data.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </div>
      </div>
    );
  }

  if (!disabledNotFoundText) {
    return <div className="my-3 font-bold text-lg">{t("notFound")}</div>;
  }

  return null;
};
