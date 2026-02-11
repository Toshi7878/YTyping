"use client";

import { Heart } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import "./css/render.css";
import { Button } from "@/components/ui/button";

const iconSizeVariants = {
  default: "",
  xs: "size-4",
} as const;

interface LikeToggleButtonProps {
  liked?: boolean;
  size?: keyof typeof iconSizeVariants;
  label?: string;
}

type IconButtonProps = Omit<ComponentProps<typeof Button>, "children" | "asChild">;

export const LikeToggleButton = ({
  onClick,
  liked = false,
  size = "default",
  label,
  className,
  ...buttonProps
}: LikeToggleButtonProps & IconButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [buttonSizePx, setButtonSizePx] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const update = (next: number) => {
      if (!Number.isFinite(next) || next <= 0) return;
      setButtonSizePx((prev) => (prev === next ? prev : next));
    };

    update(Math.round(Math.min(el.getBoundingClientRect().width, el.getBoundingClientRect().height)));

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      update(Math.round(Math.min(entry.contentRect.width, entry.contentRect.height)));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spriteSizePx = Math.max(1, Math.round(buttonSizePx * 2));

  return (
    <Button
      {...buttonProps}
      type="button"
      ref={(el) => {
        buttonRef.current = el;
        if (typeof buttonProps.ref === "function") {
          buttonProps.ref(el);
        }
      }}
      variant="unstyled"
      size="icon"
      className={cn(
        "relative gap-1",
        liked ? "text-like hover:text-like [&_svg]:fill-like" : "[&_svg]:fill-transparent",
        className,
      )}
      onClick={(e) => {
        setShouldAnimate(true);
        onClick?.(e);
      }}
    >
      <Heart
        className={cn(
          shouldAnimate && (liked ? "like-animation text-like" : "like-animation-end"),
          iconSizeVariants[size],
        )}
        strokeWidth={2.5}
      />
      {shouldAnimate && (
        <div
          className="like-base-64 pointer-events-none absolute -inset-1/2"
          style={{
            width: spriteSizePx,
            height: spriteSizePx,
            backgroundSize: `auto ${spriteSizePx}px`,
            transitionProperty: "background-position",
            transitionTimingFunction: "steps(25)",
            transitionDuration: liked ? "1s" : "0s",
            backgroundPosition: liked ? `-${spriteSizePx * 25}px 0` : "0 0",
          }}
        />
      )}

      {label && <span className="select-none font-mono text-base">{label}</span>}
    </Button>
  );
};
