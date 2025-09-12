"use client";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useCallback, useState } from "react";
import "./css/render.css";

type LikeButtonProps = {
  size?: number;
  onClick?: (isLiked: boolean) => void;
  defaultLiked?: boolean;
  className?: string;
  likeCount?: number;
  disabled?: boolean;
};

export const LikeButton = ({
  size = 50,
  defaultLiked = false,
  onClick,
  className,
  likeCount,
  disabled,
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(defaultLiked);
  const [hasAnimated, setHasAnimated] = useState(false);

  // サイズ関連の計算を分離
  const backgroundWidth = size * 25;
  const heartSize = Math.floor(size / 2);

  const buttonStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const backgroundStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundSize: `auto ${size}px`,
    transition: `background-position steps(25)`,
    transitionDuration: isLiked ? "1s" : "0s",
    backgroundPosition: isLiked ? `-${backgroundWidth}px 0` : `0 0`,
  };

  const handleClick = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // アニメーション状態を更新（初回クリック時のみ）
    if (!hasAnimated) {
      setHasAnimated(true);
    }

    onClick?.(newLikedState);
  }, [isLiked, hasAnimated, onClick]);

  const getAnimationClass = () => {
    if (!hasAnimated) return "";
    return isLiked ? "like-animation" : "like-animation-end";
  };

  return (
    <button
      disabled={disabled}
      className={cn("relative", className)}
      style={buttonStyle}
      onClick={handleClick}
      type="submit"
      suppressHydrationWarning
    >
      <div
        className={cn("like-base-64 absolute inset-0 flex items-center justify-center rounded-full")}
        style={backgroundStyle}
        suppressHydrationWarning
      >
        <Heart
          className={cn(isLiked ? "fill-like text-like" : "fill-transparent", getAnimationClass())}
          size={heartSize}
          strokeWidth={2.5}
          suppressHydrationWarning
        />
      </div>
      {typeof likeCount === "number" && <div className="absolute right-0 bottom-0 text-xs">{likeCount}</div>}
    </button>
  );
};
