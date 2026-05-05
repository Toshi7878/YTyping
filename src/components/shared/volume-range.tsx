"use client";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { HTMLAttributes } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";
import { store } from "@/app/_layout/store";
import { useIsMobileDeviceState } from "@/app/_layout/user-agent";
import { cn } from "@/lib/utils";
import { Slider } from "../ui/slider";

const volumeAtom = atomWithStorage("volume", 30, undefined, { getOnInit: true });

export const useVolume = () => useAtomValue(volumeAtom, { store });
export const getVolume = () => store.get(volumeAtom);
export const setVolume = (value: number) => store.set(volumeAtom, value);

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
