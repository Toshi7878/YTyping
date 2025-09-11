import { LikeButton } from "@/components/shared/like-button/LikeButton";
import { cn } from "@/lib/utils";
import { useLikeMutationMapList } from "@/utils/mutations/like.mutations";
import { useSession } from "next-auth/react";
import React, { useRef } from "react";
import { FiHeart } from "react-icons/fi";

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
}

const UnauthenticatedLikeCountIcon = ({ likeCount }: LikeButtonProps) => {
  return (
    <div className="text-muted-foreground flex items-baseline rounded-md px-1">
      <div className="relative top-[2.5px] mr-1">
        <FiHeart size={17} />
      </div>
      <div className="font-mono text-lg">{likeCount}</div>
    </div>
  );
};

const AuthenticatedLikeCountIconButton = ({ isLiked, likeCount, mapId }: LikeButtonProps & { mapId: number }) => {
  const { data: session } = useSession();
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleLikeList = useLikeMutationMapList();

  const handleClick = (event: React.MouseEvent) => {
    likeButtonRef.current?.click();
    event.stopPropagation();
    event.preventDefault();

    if (!session?.user?.id || toggleLikeList.isPending) return;

    // propsに基づく次状態。キャッシュはmutationの楽観更新で即時反映される
    const nextHasLike = !isLiked;
    toggleLikeList.mutate({ mapId, optimisticState: nextHasLike });
  };

  return (
    <div
      className={cn(
        "flex items-baseline rounded-md pr-1",
        isLiked ? "text-like" : "text-muted-foreground",
        session?.user.id && !toggleLikeList.isPending && "hover:bg-like/40 hover:cursor-pointer",
        toggleLikeList.isPending && "pointer-events-none opacity-60",
      )}
      suppressHydrationWarning
    >
      <div className="relative top-[10.25px] -m-1 -mt-4">
        <LikeButton defaultLiked={isLiked} size={34} likeButtonRef={likeButtonRef as any} />
      </div>
      <button
        type="button"
        className="relative top-0 font-mono text-lg"
        onClick={handleClick}
        disabled={toggleLikeList.isPending}
      >
        {likeCount}
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

  const likeOptimisticState = { isLiked, likeCount };

  return (
    <div className="flex" onClick={session?.user.id ? (e) => e.stopPropagation() : undefined}>
      {session?.user.id ? (
        <AuthenticatedLikeCountIconButton isLiked={isLiked} likeCount={likeCount} mapId={mapId} />
      ) : (
        <UnauthenticatedLikeCountIcon isLiked={isLiked} likeCount={likeCount} />
      )}
    </div>
  );
};

export default LikeCountIcon;
