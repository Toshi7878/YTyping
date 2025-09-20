import { LikeButton } from "@/components/shared/like-button/LikeButton";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/provider";
import { useLikeMutationMapInfo } from "@/utils/mutations/like.mutations";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const LikeIconButton = () => {
  const { id: mapId } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const { data: mapInfo } = useQuery(trpc.map.getMapInfo.queryOptions({ mapId: Number(mapId) }));
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
        size={isSmScreen ? 96 : 64}
        defaultLiked={hasLiked ?? false}
        className={cn("bottom-3.5", hasLiked ? "hover:opacity-80" : "hover:text-foreground/90")}
      />
    </TooltipWrapper>
  );
};

export default LikeIconButton;
