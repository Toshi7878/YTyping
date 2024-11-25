import { Box, Flex, useTheme } from "@chakra-ui/react";
import React, { memo } from "react";
import { FiHeart } from "react-icons/fi";
import { MapCardInfo } from "@/app/(home)/ts/type";
import { LocalLikeState, ThemeColors } from "@/types";
import { useFormState } from "react-dom";
import { INITIAL_STATE } from "@/config/consts";
import { useLocalLikeServerActions } from "@/lib/hooks/useLocalLikeServerActions";
import { useSession } from "next-auth/react";
import { LikeButton } from "@/components/like-button/LikeButton";

interface LikeButtonProps {
  likeOptimisticState: LocalLikeState;
}

const LogoutLikeButton = ({ likeOptimisticState }: LikeButtonProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Flex
      as="button"
      type="button"
      alignItems="baseline"
      color={`${theme.colors.text.body}99`}
      rounded="md"
      px={1}
    >
      <Box mr={1} position="relative" top="2.5px">
        <FiHeart size={17} />
      </Box>
      <Box fontSize="lg" fontFamily="monospace">
        {likeOptimisticState.likeCount}
      </Box>
    </Flex>
  );
};

const ActiveLikeButton = ({ likeOptimisticState }: LikeButtonProps) => {
  const theme: ThemeColors = useTheme();

  const { data: session } = useSession();

  return (
    <Flex
      as="button"
      type={session?.user.id ? "submit" : "button"}
      alignItems="baseline"
      color={
        likeOptimisticState.hasLike ? theme.colors.semantic.like : `${theme.colors.text.body}99`
      }
      rounded="md"
      _hover={session?.user.id ? { bg: `${theme.colors.semantic.like}60` } : ""}
      pr={1}
    >
      <Box m={-1} mt={-4} position="relative" top="10.25px">
        <LikeButton defaultLiked={likeOptimisticState.hasLike} size={34} />
      </Box>
      <Box fontSize="lg" fontFamily="monospace" position="relative" top="0px">
        {likeOptimisticState.likeCount}
      </Box>
    </Flex>
  );
};

interface LikeCountProps {
  map: MapCardInfo;
}

const LikeCount = (props: LikeCountProps) => {
  const { map } = props;
  const { data: session } = useSession();
  const { likeOptimisticState, toggleLikeAction } = useLocalLikeServerActions({
    hasLike: props.map.mapLike?.isLiked,
    likeCount: props.map.likeCount,
  });

  const [state, formAction] = useFormState(async () => {
    const result = await toggleLikeAction(map.id);

    return result;
  }, INITIAL_STATE);
  const preventClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
  return (
    <Flex
      as="form"
      action={session?.user.id ? formAction : ""}
      onClick={session?.user.id ? preventClick : undefined}
    >
      {session?.user.id ? (
        <ActiveLikeButton likeOptimisticState={likeOptimisticState} />
      ) : (
        <LogoutLikeButton likeOptimisticState={likeOptimisticState} />
      )}
    </Flex>
  );
};

export default memo(LikeCount);
