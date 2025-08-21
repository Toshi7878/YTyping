import { useIsLikeAtom, useSetIsLikeAtom } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { LikeButton } from "@/components/share-components/like-button/LikeButton";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { INITIAL_STATE } from "@/config/globalConst";
import { useBreakPoint } from "@/lib/useBreakPoint";
import { toggleLikeServerAction } from "@/server/actions/toggleLikeActions";
import { UploadResult } from "@/types";
import { useParams } from "next/navigation";
import { useActionState } from "react";

const LikeIcon = () => {
  const { id: mapId } = useParams();
  const { isMdScreen } = useBreakPoint();

  const isLikeAtom = useIsLikeAtom();
  const setIsLikeAtom = useSetIsLikeAtom();

  const toggleLikeAction = (state: UploadResult): Promise<UploadResult> => {
    const newHasLike = !isLikeAtom;
    setIsLikeAtom(newHasLike);

    try {
      return toggleLikeServerAction(Number(mapId), newHasLike);
    } catch (error) {
      // エラーが発生した場合、元の状態に戻す
      setIsLikeAtom(isLikeAtom);
      return Promise.reject(error); // エラーを返す
    }
  };

  const [state, formAction] = useActionState(toggleLikeAction, INITIAL_STATE);

  return (
    <TooltipWrapper label="譜面にいいね" sideOffset={-8}>
      <form action={formAction} className="hover:opacity-80">
        <LikeButton size={isMdScreen ? 62 : 120} defaultLiked={isLikeAtom} />
      </form>
    </TooltipWrapper>
  );
};

export default LikeIcon;
