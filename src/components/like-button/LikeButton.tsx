import { clsx } from "clsx";
import { Heart } from "lucide-react";
import React from "react";
import "./css/render.css";

type LikeButtonProps = {
  size?: number;
  text?: string;
  onClick?: (arg0: boolean) => void;
  defaultLiked?: boolean;
  likeButtonRef: React.RefObject<HTMLButtonElement>;
};

export const LikeButton = ({
  size = 50,
  defaultLiked = false,
  text,
  onClick,
  likeButtonRef,
}: LikeButtonProps) => {
  const width = Math.floor(size * 25);
  const [isLiked, setIsLiked] = React.useState(defaultLiked);
  const [clicked, setClicked] = React.useState(false);

  const handleOnClick = () => {
    if (onClick) onClick(!isLiked);
    setIsLiked(!isLiked);
    if (!clicked) setClicked(true);
  };

  return (
    <button
      ref={likeButtonRef}
      className="relative flex items-center justify-center"
      style={{
        width: text ? "auto" : `${size}px`,
        height: `${size}px`,
        paddingLeft: text ? `${size}px` : "0",
      }}
      onClick={handleOnClick}
      type="submit"
    >
      <div
        className={clsx(
          `like-base-64 absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center rounded-full`,
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundSize: `auto ${size}px`,
          transition: `background-position steps(25)`,
          transitionDuration: isLiked ? "1s" : "0s",
          backgroundPosition: isLiked ? `-${width}px 0` : `0 0`,
        }}
      >
        <Heart
          className={clsx(
            isLiked ? "fill-pink-400 text-pink-400" : "fill-transparent",
            clicked ? (isLiked ? "like-animation" : "like-animation-end") : "",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={2.5}
        />
      </div>
      {text && (
        <span className={clsx("text-sm", isLiked ? "text-pink-400" : "text-gray-400")}>{text}</span>
      )}
    </button>
  );
};
