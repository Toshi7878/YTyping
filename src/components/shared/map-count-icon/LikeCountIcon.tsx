import { LikeButtonWithCount } from "@/components/shared/like-button/LikeButton";
import { cn } from "@/lib/utils";
import { useLikeMutationMapList } from "@/utils/mutations/like.mutations";
import { useSession } from "next-auth/react";
import React from "react";
import { FiHeart } from "react-icons/fi";

const UnauthenticatedLikeCountIcon = ({ likeCount }: { likeCount: number }) => {
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

const AuthenticatedLikeCountIconButton = ({ isLiked, likeCount, mapId }: LikeCountIconProps) => {
  const setLikeMutation = useLikeMutationMapList();

  const handleClick = (event: React.MouseEvent, newLikeValue: boolean) => {
    event.stopPropagation();
    event.preventDefault();

    if (setLikeMutation.isPending) return;

    setLikeMutation.mutate({ mapId, likeValue: newLikeValue });
  };

  return (
    <div
      className={cn("flex items-baseline rounded-md pr-1", isLiked ? "text-like" : "text-muted-foreground")}
      suppressHydrationWarning
    >
      <LikeButtonWithCount
        onClick={handleClick}
        defaultLiked={isLiked}
        size={34}
        likeCount={likeCount}
        disabled={setLikeMutation.isPending}
        className="!hover:bg-like/40"
      />
    </div>
  );
};

const LikeCountIcon = ({ mapId, isLiked, likeCount }: LikeCountIconProps) => {
  const { data: session } = useSession();

  return (
    <div className="flex" onClick={session?.user.id ? (e) => e.stopPropagation() : undefined}>
      {session?.user.id ? (
        <AuthenticatedLikeCountIconButton isLiked={isLiked} likeCount={likeCount} mapId={mapId} />
      ) : (
        <UnauthenticatedLikeCountIcon likeCount={likeCount} />
      )}
    </div>
  );
};

export default LikeCountIcon;
