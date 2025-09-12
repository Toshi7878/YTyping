import { LikeButton } from "@/components/shared/like-button/LikeButton";
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
  const { data: session } = useSession();
  const setLikeMutation = useLikeMutationMapList();

  const handleClick = (event: React.MouseEvent) => {
    if (setLikeMutation.isPending) return;

    event.stopPropagation();
    event.preventDefault();

    if (!session?.user?.id || setLikeMutation.isPending) return;

    setLikeMutation.mutate({ mapId, isLiked: !isLiked });
  };

  return (
    <div
      className={cn(
        "flex items-baseline rounded-md pr-1",
        isLiked ? "text-like" : "text-muted-foreground",
        session?.user.id && !setLikeMutation.isPending && "hover:bg-like/40 hover:cursor-pointer",
      )}
      suppressHydrationWarning
    >
      <div className="relative top-0 flex items-center font-mono text-lg" onClick={handleClick}>
        <LikeButton defaultLiked={isLiked} size={34} likeCount={likeCount} disabled={setLikeMutation.isPending} />
      </div>
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
