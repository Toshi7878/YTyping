import { LikeButton } from "@/components/share-components/like-button/LikeButton";
import { INITIAL_STATE } from "@/config/consts/globalConst";
import { LocalLikeState, ThemeColors } from "@/types";
import { useLocalLikeServerActions } from "@/util/global-hooks/useLocalLikeServerActions";
import { Box, Flex, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import React, { memo, useRef } from "react";
import { useFormState } from "react-dom";
import { FiHeart } from "react-icons/fi";

interface LikeButtonProps {
  likeOptimisticState: LocalLikeState;
}

const UnauthenticatedLikeCountIcon = ({ likeOptimisticState }: LikeButtonProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Flex alignItems="baseline" color={`${theme.colors.text.body}99`} rounded="md" px={1}>
      <Box mr={1} position="relative" top="2.5px">
        <FiHeart size={17} />
      </Box>
      <Box fontSize="lg" fontFamily="monospace">
        {likeOptimisticState.likeCount}
      </Box>
    </Flex>
  );
};

const AuthenticatedLikeCountIconButton = ({ likeOptimisticState }: LikeButtonProps) => {
  const theme: ThemeColors = useTheme();

  const { data: session } = useSession();
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Flex
      alignItems="baseline"
      color={likeOptimisticState.hasLike ? theme.colors.semantic.like : `${theme.colors.text.body}99`}
      rounded="md"
      _hover={session?.user.id ? { bg: `${theme.colors.semantic.like}60` } : ""}
      pr={1}
      zIndex={1}
      cursor={"pointer"}
    >
      <Box m={-1} mt={-4} position="relative" top="10.25px">
        <LikeButton defaultLiked={likeOptimisticState.hasLike} size={34} likeButtonRef={likeButtonRef} />
      </Box>
      <Box
        as="button"
        type="button"
        fontSize="lg"
        fontFamily="monospace"
        position="relative"
        top="0px"
        onClick={(event: React.MouseEvent) => {
          // LikeButtonのクリックイベントをトリガー
          likeButtonRef.current!.click();
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        {likeOptimisticState.likeCount}
      </Box>
    </Flex>
  );
};

interface LikeCountIconProps {
  mapId: number;
  isLiked: boolean;
  likeCount: number;
}

const LikeCountIcon = ({ mapId, isLiked, likeCount }: LikeCountIconProps) => {
  const { data: session } = useSession();
  const { likeOptimisticState, toggleLikeAction } = useLocalLikeServerActions({
    hasLike: isLiked,
    likeCount,
  });

  const [state, formAction] = useFormState(async () => {
    const result = await toggleLikeAction(mapId);

    return result;
  }, INITIAL_STATE);
  const preventClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
  return (
    <Flex as="form" action={session?.user.id ? formAction : ""} onClick={session?.user.id ? preventClick : undefined}>
      {session?.user.id ? (
        <AuthenticatedLikeCountIconButton likeOptimisticState={likeOptimisticState} />
      ) : (
        <UnauthenticatedLikeCountIcon likeOptimisticState={likeOptimisticState} />
      )}
    </Flex>
  );
};

export default memo(LikeCountIcon);
