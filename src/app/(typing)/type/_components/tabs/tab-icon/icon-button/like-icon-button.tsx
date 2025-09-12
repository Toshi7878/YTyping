import { useIsLikeState, useSetIsLikeState as useSetIsLiked } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LikeButton } from "@/components/shared/like-button/LikeButton";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { cn } from "@/lib/utils";
import { useLikeMutationMapInfo } from "@/utils/mutations/like.mutations";
import { useParams } from "next/navigation";

const LikeIconButton = () => {
  const { id: mapId } = useParams<{ id: string }>();

  const isLiked = useIsLikeState();
  const setIsLiked = useSetIsLiked();
  const { isSmScreen } = useBreakPoint();

  const setMapLike = useLikeMutationMapInfo();

  const handleClick = () => {
    if (setMapLike.isPending) return;

    setMapLike.mutate(
      { mapId: Number(mapId), likeValue: !isLiked },
      {
        onError: (err) => {
          console.log(err);
          setIsLiked(isLiked);
        },
        onSuccess: ({ isLiked: next }) => {
          setIsLiked(next);
        },
      },
    );
  };

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <LikeButton
        onClick={handleClick}
        size={isSmScreen ? 96 : 64}
        defaultLiked={isLiked}
        className={cn("bottom-3.5", isLiked ? "hover:opacity-80" : "hover:text-foreground/90")}
      />
    </TooltipWrapper>
  );
};

export default LikeIconButton;
