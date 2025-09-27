"use client";
import type { HTMLAttributes } from "react";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";
import { useSetVolume, useUserAgent, useVolumeState } from "@/lib/global-atoms";
import { Slider } from "../ui/slider";

interface VolumeRangeProps {
  player: YT.Player | null;
}

export default function VolumeRange({ player, ...props }: VolumeRangeProps & HTMLAttributes<HTMLFieldSetElement>) {
  const volume = useVolumeState();
  const setVolume = useSetVolume();
  const userAgent = useUserAgent();
  const isMobile = userAgent?.getDevice().type === "mobile";

  if (isMobile) return null;

  const handleChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  return (
    <div className="flex items-center">
      <fieldset
        className="bg-card flex flex-row items-center gap-2 rounded-full px-4 py-2"
        aria-label="音量調整"
        {...props}
      >
        <VolumeIcon volume={volume} />
        <Slider
          value={[volume]}
          onValueChange={handleChange}
          max={100}
          min={0}
          step={1}
          className="w-[200px]"
          aria-label={`音量: ${volume}%`}
        />
      </fieldset>
    </div>
  );
}

const VolumeIcon = ({ volume }: { volume: number }) => {
  if (volume === 0) {
    return <IoMdVolumeMute size={24} aria-label="ミュート" />;
  }
  if (volume < 50) {
    return <IoMdVolumeLow size={24} aria-label="音量低" />;
  }
  return <IoMdVolumeHigh size={24} aria-label="音量高" />;
};
