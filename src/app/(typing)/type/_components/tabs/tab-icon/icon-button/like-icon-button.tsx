import { useQuery } from "@tanstack/react-query";
import { useMapIdState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { LikeButton } from "@/components/shared/like-button/like-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useLikeMutationMapInfo } from "@/lib/mutations/like.mutations";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useBreakPoint } from "@/utils/hooks/use-break-point";

export const LikeIconButton = () => {
  const mapId = useMapIdState();
  const trpc = useTRPC();
  const { data: mapInfo } = useQuery(trpc.map.getMapInfo.queryOptions({ mapId }));
  const hasLiked = mapInfo?.hasLiked;
  const { isSmScreen } = useBreakPoint();

  const setMapLike = useLikeMutationMapInfo();

  const handleClick = () => {
    if (setMapLike.isPending) return;

    setMapLike.mutate({ mapId: Number(mapId), newState: !hasLiked });
  };

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <LikeButton
        onClick={handleClick}
        size={isSmScreen ? 164 : 64}
        defaultLiked={hasLiked ?? false}
        className={cn("bottom-3.5 max-sm:mb-[-25px]", hasLiked ? "hover:opacity-80" : "hover:text-foreground/90")}
      />
    </TooltipWrapper>
  );
};
