import { useProgress } from "@bprogress/next";
import { useSession } from "next-auth/react";
import type React from "react";
import { FiHeart } from "react-icons/fi";
import { LikeButtonWithCount } from "@/components/shared/like-button/like-button";
import { useLikeMutationMapList } from "@/lib/mutations/like.mutations";

const InactiveLikeCount = ({ likeCount }: { likeCount: number }) => {
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
  hasLiked: boolean;
  likeCount: number;
}

const ActiveLikeCountButton = ({ hasLiked, likeCount, mapId }: LikeCountIconProps) => {
  const setLikeMutation = useLikeMutationMapList();
  const { stop } = useProgress();

  const handleClick = (event: React.MouseEvent, newState: boolean) => {
    event.stopPropagation();
    event.preventDefault();

    if (setLikeMutation.isPending) return;

    setLikeMutation.mutate({ mapId, newState });
    stop();
  };

  return (
    <LikeButtonWithCount
      onClick={handleClick}
      defaultLiked={hasLiked}
      size={34}
      likeCount={likeCount}
      disabled={setLikeMutation.isPending}
    />
  );
};

export const LikeCountIcon = ({ mapId, hasLiked, likeCount }: LikeCountIconProps) => {
  const { data: session } = useSession();

  return (
    <div className="z-30" onClick={session?.user.id ? (e) => e.stopPropagation() : undefined}>
      {session?.user.id ? (
        <ActiveLikeCountButton hasLiked={hasLiked} likeCount={likeCount} mapId={mapId} />
      ) : (
        <InactiveLikeCount likeCount={likeCount} />
      )}
    </div>
  );
};
