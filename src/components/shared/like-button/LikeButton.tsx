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

  return (
    <button
      disabled={disabled}
      className={cn("relative cursor-pointer", className)}
      style={buttonStyle}
      type="button"
      suppressHydrationWarning
      onClick={(event: React.MouseEvent) => {
        const newLikeValue = !isLiked;
        setIsLiked(newLikeValue);

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
  className,
  likeCount,
  disabled,
}: LikeButtonProps & { likeCount: number }) => {
  const [isLiked, setIsLiked] = useState(defaultLiked);

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

  return (
    <button
      disabled={disabled}
      className={cn("relative", className)}
      style={buttonStyle}
      type="button"
      suppressHydrationWarning
      onClick={(event: React.MouseEvent) => {
        const newLikeValue = !isLiked;
        setIsLiked(newLikeValue);

        onClick?.(event, newLikeValue);
      }}
    >
      <div
        className={cn("like-base-64 absolute inset-0 flex items-center justify-center rounded-full")}
        style={backgroundStyle}
        suppressHydrationWarning
      >
        <Heart
          className={cn(isLiked ? "fill-like text-like like-animation" : "like-animation-end fill-transparent")}
          size={heartSize}
          strokeWidth={2.5}
          suppressHydrationWarning
        />
      </div>
      {typeof likeCount === "number" && <div className="absolute right-0 bottom-0 text-xs">{likeCount}</div>}
    </button>
  );
};
