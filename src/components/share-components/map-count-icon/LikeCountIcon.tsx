import { LikeButton } from "@/components/share-components/like-button/LikeButton";
import { INITIAL_STATE } from "@/config/globalConst";
import { cn } from "@/lib/utils";
import { LocalLikeState } from "@/types";
import { useLocalLikeServerActions } from "@/utils/global-hooks/useLocalLikeServerActions";
import { useSession } from "next-auth/react";
import React, { memo, useActionState, useRef } from "react";
import { FiHeart } from "react-icons/fi";

interface LikeButtonProps {
  likeOptimisticState: LocalLikeState;
}

const UnauthenticatedLikeCountIcon = ({ likeOptimisticState }: LikeButtonProps) => {
  return (
    <div className="text-muted-foreground/60 flex items-baseline rounded-md px-1">
      <div className="relative top-[2.5px] mr-1">
        <FiHeart size={17} />
      </div>
      <div className="font-mono text-lg">{likeOptimisticState.likeCount}</div>
    </div>
  );
};

const AuthenticatedLikeCountIconButton = ({ likeOptimisticState }: LikeButtonProps) => {
  const { data: session } = useSession();
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={cn(
        "flex items-baseline rounded-md pr-1",
        likeOptimisticState.hasLike ? "text-like" : "text-muted-foreground/60",
        session?.user.id && "hover:bg-like/40 hover:cursor-pointer",
      )}
    >
      <div className="relative top-[10.25px] -m-1 -mt-4">
        <LikeButton defaultLiked={likeOptimisticState.hasLike} size={34} likeButtonRef={likeButtonRef as any} />
      </div>
      <button
        type="button"
        className="relative top-0 font-mono text-lg"
        onClick={(event: React.MouseEvent) => {
          likeButtonRef.current!.click();
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        {likeOptimisticState.likeCount}
      </button>
    </div>
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

  const [state, formAction] = useActionState(async () => {
    const result = await toggleLikeAction(mapId);
    return result;
  }, INITIAL_STATE);

  const preventClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <form
      action={session?.user.id ? formAction : ""}
      onClick={session?.user.id ? preventClick : undefined}
      className="flex"
    >
      {session?.user.id ? (
        <AuthenticatedLikeCountIconButton likeOptimisticState={likeOptimisticState} />
      ) : (
        <UnauthenticatedLikeCountIcon likeOptimisticState={likeOptimisticState} />
      )}
    </form>
  );
};

export default memo(LikeCountIcon);
