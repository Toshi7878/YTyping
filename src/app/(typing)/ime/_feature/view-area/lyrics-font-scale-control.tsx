"use client";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { getSession } from "@/auth/client";
import { DEFAULT_IME_OPTIONS } from "@/server/drizzle/schema";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";
import resetIcon from "../../_img/arrow-circle-double.png";
import enlargeIcon from "../../_img/control-090.png";
import shrinkIcon from "../../_img/control-270.png";
import { getImeOptions, setLyricsFontScale, useLyricsFontScaleState } from "../provider";

const MIN_SCALE = 80;
const MAX_SCALE = 200;
const STEP = 10;

interface LyricsFontScaleControlProps {
  className?: string;
}

export const LyricsFontScaleControl = ({ className }: LyricsFontScaleControlProps) => {
  const trpc = useTRPC();
  const updateImeTypingOptions = useMutation(trpc.user.imeTypingOption.upsert.mutationOptions());
  const lyricsFontScale = useLyricsFontScaleState();

  const applyScale = (next: number) => {
    if (next === lyricsFontScale) return;

    setLyricsFontScale(next);
    if (getSession()) {
      updateImeTypingOptions.mutate({ ...getImeOptions(), lyricsFontScale: next });
    }
  };

  const changeScale = (delta: number) => {
    applyScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, lyricsFontScale + delta)));
  };

  return (
    <div
      className={cn("flex items-center gap-1 rounded-md bg-white/10 p-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipWrapper label="歌詞文字サイズを縮小" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => changeScale(-STEP)}
          disabled={lyricsFontScale === MIN_SCALE}
        >
          <Image src={shrinkIcon} alt="縮小" width={14} height={14} />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper label="歌詞文字サイズを拡大" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => changeScale(STEP)}
          disabled={lyricsFontScale === MAX_SCALE}
        >
          <Image src={enlargeIcon} alt="拡大" width={14} height={14} />
        </Button>
      </TooltipWrapper>
      <TooltipWrapper label="歌詞文字サイズをリセット" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => applyScale(DEFAULT_IME_OPTIONS.lyricsFontScale)}
          disabled={lyricsFontScale === DEFAULT_IME_OPTIONS.lyricsFontScale}
        >
          <Image src={resetIcon} alt="リセット" width={14} height={14} />
        </Button>
      </TooltipWrapper>
    </div>
  );
};
