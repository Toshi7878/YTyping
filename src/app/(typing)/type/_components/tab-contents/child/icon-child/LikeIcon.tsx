import { useIsLikeAtom, useSetIsLikeAtom } from "@/app/(typing)/type/atoms/stateAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { LikeButton } from "@/components/share-components/like-button/LikeButton";
import { INITIAL_STATE } from "@/config/consts/globalConst";
import { toggleLikeServerAction } from "@/server/actions/toggleLikeActions";
import { UploadResult } from "@/types";
import { useParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const LikeIcon = () => {
  const { id: mapId } = useParams();
  const [iconSize, setIconSize] = useState(120);

  const isLikeAtom = useIsLikeAtom();

  const setIsLikeAtom = useSetIsLikeAtom();

  useEffect(() => {
    const handleResize = () => {
      setIconSize(window.innerWidth >= 768 ? 62 : 120);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <CustomToolTip label="譜面にいいね" placement="top" top={1}>
      <form action={formAction} className="hover:opacity-80">
        <LikeButton size={iconSize} defaultLiked={isLikeAtom} />
      </form>
    </CustomToolTip>
  );
};

export default LikeIcon;
