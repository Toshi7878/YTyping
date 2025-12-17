import { useSuspenseQuery } from "@tanstack/react-query";
import { useMapIdState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { LikeButton } from "@/components/shared/like-button/like-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useToggleMapLikeMutation } from "@/lib/mutations/like";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";

export const LikeIconButton = () => {
  const { isSmScreen } = useBreakPoint();
  const toggleMapLike = useToggleMapLikeMutation();
  const trpc = useTRPC();
  const mapId = useMapIdState();
  const { data: mapInfo } = useSuspenseQuery(trpc.map.getMapInfo.queryOptions({ mapId: mapId ?? 0 }));

  const handleClick = () => {
    if (toggleMapLike.isPending) return;

    toggleMapLike.mutate({ mapId: mapInfo.id, newState: !mapInfo.like.hasLiked });
  };

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <LikeButton
        onClick={handleClick}
        size={isSmScreen ? 164 : 64}
        defaultLiked={mapInfo.like.hasLiked}
        className={cn(
          "bottom-3.5 max-sm:mb-[-25px]",
          mapInfo.like.hasLiked ? "hover:opacity-80" : "hover:text-foreground/90",
        )}
      />
    </TooltipWrapper>
  );
};
