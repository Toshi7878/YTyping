import { LikeButtonWithCount } from "@/components/shared/like-button/LikeButton";
import { useLikeMutationMapList } from "@/utils/mutations/like.mutations";
import { useProgress } from "@bprogress/next";
import { useSession } from "next-auth/react";
import React from "react";
import { FiHeart } from "react-icons/fi";

const InactiveLikeCountIcon = ({ likeCount }: { likeCount: number }) => {
  return (
    <div className="text-muted-foreground flex items-baseline rounded-md px-1">
      <div className="relative top-[2.5px] mr-1">
        <FiHeart size={17} />
      </div>
      <div className="font-mono text-lg">{likeCount}</div>
    </div>
  );
};

interface LikeCountIconProps {
  mapId: number;
  isLiked: boolean;
  likeCount: number;
}

const ActiveLikeCountIconButton = ({ isLiked, likeCount, mapId }: LikeCountIconProps) => {
  const setLikeMutation = useLikeMutationMapList();
  const { stop } = useProgress();

  const handleClick = (event: React.MouseEvent, newLikeValue: boolean) => {
    event.stopPropagation();
    event.preventDefault();

    if (setLikeMutation.isPending) return;

    setLikeMutation.mutate({ mapId, likeValue: newLikeValue });
    stop();
  };

  return (
    <LikeButtonWithCount
      onClick={handleClick}
      defaultLiked={isLiked}
      size={34}
      likeCount={likeCount}
      disabled={setLikeMutation.isPending}
    />
  );
};

const LikeCountIcon = ({ mapId, isLiked, likeCount }: LikeCountIconProps) => {
  const { data: session } = useSession();

  return (
    <div className="z-30" onClick={session?.user.id ? (e) => e.stopPropagation() : undefined}>
      {session?.user.id ? (
        <ActiveLikeCountIconButton isLiked={isLiked} likeCount={likeCount} mapId={mapId} />
      ) : (
        <InactiveLikeCountIcon likeCount={likeCount} />
      )}
    </div>
  );
};

export default LikeCountIcon;
