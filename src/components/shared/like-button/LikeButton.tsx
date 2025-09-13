"use client";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useState } from "react";
import "./css/render.css";

type LikeButtonProps = {
  size?: number;
  onClick?: (event: React.MouseEvent, likeValue: boolean) => void;
  defaultLiked?: boolean;
  className?: string;
  likeCount?: number;
  disabled?: boolean;
};

export const LikeButton = ({ size = 50, defaultLiked = false, onClick, className, disabled }: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(defaultLiked);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

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
    transition: hasBeenClicked ? `background-position steps(25)` : "none",
    transitionDuration: hasBeenClicked && isLiked ? "1s" : "0s",
    backgroundPosition: isLiked ? `-${backgroundWidth}px 0` : `0 0`,
  };

  return (
    <button
      disabled={disabled}
      className={cn("relative cursor-pointer", className)}
      style={buttonStyle}
      type="button"
      onClick={(event: React.MouseEvent) => {
        const newLikeValue = !isLiked;
        setIsLiked(newLikeValue);
        setHasBeenClicked(true);

        onClick?.(event, newLikeValue);
      }}
    >
      <div
        className={cn("like-base-64 absolute inset-0 flex items-center justify-center rounded-full")}
        style={backgroundStyle}
      >
        <Heart
          className={cn(isLiked ? "fill-like text-like like-animation" : "like-animation-end fill-transparent")}
          size={heartSize}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
};

export const LikeButtonWithCount = ({
  size = 50,
  defaultLiked = false,
  onClick,
  likeCount,
  disabled,
}: LikeButtonProps & { likeCount: number }) => {
  const [isLiked, setIsLiked] = useState(defaultLiked);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const backgroundWidth = size * 25;
  const heartSize = Math.floor(size / 2);

  const buttonStyle = {
    height: `${size}px`,
  };

  const backgroundStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundSize: `auto ${size}px`,
    transition: hasBeenClicked ? `background-position steps(25)` : "none",
    transitionDuration: hasBeenClicked && isLiked ? "1s" : "0s",
    backgroundPosition: isLiked ? `-${backgroundWidth}px 0` : `0 0`,
  };

  return (
    <button
      disabled={disabled}
      className="hover:bg-like/40 relative top-[0.09px] flex w-9 cursor-pointer items-center justify-center space-x-1 rounded-sm px-1"
      style={buttonStyle}
      type="button"
      onClick={(event: React.MouseEvent) => {
        const newLikeValue = !isLiked;
        setIsLiked(newLikeValue);
        setHasBeenClicked(true);
        onClick?.(event, newLikeValue);
      }}
    >
      <div className="relative top-0 flex items-center" style={{ width: `${size}px`, height: `${size}px` }}>
        <Heart
          className={cn(
            "z-10",
            hasBeenClicked && isLiked ? "like-animation" : "like-animation-end",
            isLiked ? "fill-like text-like" : "text-muted-foreground fill-transparent",
          )}
          size={heartSize}
          strokeWidth={2.5}
        />
        <div className={cn("like-base-64 absolute inset-y-0 -right-[8.25px]")} style={backgroundStyle} />
      </div>
      {/* カウント表示 */}
      {typeof likeCount === "number" && (
        <span className={cn("font-mono text-lg select-none", isLiked ? "text-like" : "text-muted-foreground")}>
          {likeCount}
        </span>
      )}
    </button>
  );
};
