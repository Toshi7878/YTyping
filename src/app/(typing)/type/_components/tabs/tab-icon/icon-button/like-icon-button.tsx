import { useMapInfoState } from "@/app/(typing)/type/_lib/atoms/hydrate";
import { LikeButton } from "@/components/shared/like-button/like-button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useLikeMutationMapInfo } from "@/lib/mutations/like.mutations";
import { cn } from "@/lib/utils";
import { useBreakPoint } from "@/utils/hooks/use-break-point";

export const LikeIconButton = () => {
  const { isSmScreen } = useBreakPoint();
  const mapInfo = useMapInfoState();
  const setMapLike = useLikeMutationMapInfo();

  const handleClick = () => {
    if (setMapLike.isPending || !mapInfo) return;

    setMapLike.mutate({ mapId: mapInfo.id, newState: !mapInfo.hasLiked });
  };

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <LikeButton
        onClick={handleClick}
        size={isSmScreen ? 164 : 64}
        defaultLiked={mapInfo?.hasLiked ?? false}
        className={cn(
          "bottom-3.5 max-sm:mb-[-25px]",
          mapInfo?.hasLiked ? "hover:opacity-80" : "hover:text-foreground/90",
        )}
      />
    </TooltipWrapper>
  );
};
