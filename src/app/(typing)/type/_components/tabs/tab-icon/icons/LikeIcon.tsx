import { useIsLikeState, useSetIsLikeState as useSetIsLiked } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LikeButton } from "@/components/shared/like-button/LikeButton";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { INITIAL_STATE } from "@/config/globalConst";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { cn } from "@/lib/utils";
import { toggleLikeServerAction } from "@/server/actions/toggleLikeActions";
import { UploadResult } from "@/types";
import { useParams } from "next/navigation";
import { useActionState } from "react";

const LikeIcon = () => {
  const { id: mapId } = useParams<{ id: string }>();

  const isLiked = useIsLikeState();
  const setIsLiked = useSetIsLiked();
  const { isSmScreen } = useBreakPoint();

  const toggleLikeAction = (state: UploadResult): Promise<UploadResult> => {
    const newHasLike = !isLiked;
    setIsLiked(newHasLike);

    try {
      return toggleLikeServerAction(Number(mapId), newHasLike);
    } catch (error) {
      // エラーが発生した場合、元の状態に戻す
      setIsLiked(isLiked);
      return Promise.reject(error); // エラーを返す
    }
  };

  const [state, formAction] = useActionState(toggleLikeAction, INITIAL_STATE);

  return (
    <TooltipWrapper label="譜面にいいね" delayDuration={500} className="relative top-1">
      <form action={formAction}>
        <LikeButton
          size={isSmScreen ? 96 : 64}
          defaultLiked={isLiked}
          className={cn("bottom-3.5 cursor-pointer", isLiked ? "hover:opacity-80" : "hover:text-foreground/90")}
        />
      </form>
    </TooltipWrapper>
  );
};

export default LikeIcon;
