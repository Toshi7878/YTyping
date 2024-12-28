import { useHasLocalLikeAtom, useSetHasLocalLikeAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { LikeButton } from "@/components/like-button/LikeButton";
import { INITIAL_STATE } from "@/config/consts";
import { toggleLikeServerAction } from "@/server/actions/toggleLikeActions";
import { ThemeColors, UploadResult } from "@/types";
import { Box, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useFormState } from "react-dom";

const LikeIcon = () => {
  const theme: ThemeColors = useTheme();

  const { id: mapId } = useParams();

  const hasLocalLikeAtom = useHasLocalLikeAtom();

  const setHasLocalLikeAtom = useSetHasLocalLikeAtom();

  const toggleLikeAction = (state: UploadResult): Promise<UploadResult> => {
    // 楽観的UI更新
    const newHasLike = !hasLocalLikeAtom;
    setHasLocalLikeAtom(newHasLike);

    try {
      return toggleLikeServerAction(Number(mapId), newHasLike);
    } catch (error) {
      // エラーが発生した場合、元の状態に戻す
      setHasLocalLikeAtom(hasLocalLikeAtom);
      return Promise.reject(error); // エラーを返す
    }
  };

  const [state, formAction] = useFormState(toggleLikeAction, INITIAL_STATE);
  return (
    <CustomToolTip tooltipLabel="譜面にいいね" placement="top">
      <Box as="form" action={formAction} _hover={{ color: theme.colors.text.body }}>
        <LikeButton size={62} defaultLiked={hasLocalLikeAtom} />
      </Box>
    </CustomToolTip>
  );
};

export default LikeIcon;
