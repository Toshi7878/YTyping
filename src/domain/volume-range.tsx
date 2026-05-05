"use client";
import type { HTMLAttributes } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";
import { cn } from "@/lib/tailwind";
import { useIsMobileDeviceState } from "@/store/user-agent";
import { setVolume, useVolume } from "@/store/volume";
import { Slider } from "@/ui/slider";

interface VolumeRangeProps {
  YTPlayer: YT.Player | null;
  size?: "sm" | "md";
  sliderClassName?: string;
}

export const VolumeRange = ({
  YTPlayer,
  className,
  size = "md",
  sliderClassName,
  ...props
}: VolumeRangeProps & HTMLAttributes<HTMLFieldSetElement>) => {
  const volume = useVolume();
  const isMobile = useIsMobileDeviceState();

  if (isMobile) return null;

  const handleChange = (value: number[]) => {
    const newVolume = value[0];
    if (!newVolume) return;

    setVolume(newVolume);
    if (YTPlayer) {
      YTPlayer.setVolume(newVolume);
    }
  };

  return (
    <fieldset
      className={cn(
        "flex flex-row items-center gap-2 rounded-full bg-card px-4 py-2",
        size === "sm" && "px-2 py-1",
        size === "md" && "px-4 py-2",
        className,
      )}
      aria-label="音量調整"
      {...props}
    >
      <VolumeIcon volume={volume} />
      <Slider
        value={[volume]}
        onValueChange={handleChange}
        max={100}
        min={0}
        className={cn("w-[200px]", sliderClassName)}
        aria-label={`音量: ${volume}%`}
      />
    </fieldset>
  );
};

const VolumeIcon = ({ volume }: { volume: number }) => {
  if (volume === 0) {
    return <IoMdVolumeMute size={24} aria-label="ミュート" />;
  }
  if (volume < 50) {
    return <IoMdVolumeLow size={24} aria-label="音量低" />;
  }
  return <IoMdVolumeHigh size={24} aria-label="音量高" />;
};
