"use client";
import { useSetVolume, useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { useUserAgent } from "@/utils/useUserAgent";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";
import { Slider } from "../ui/slider";

interface VolumeRangeProps {
  player: YTPlayer | null;
}

export default function VolumeRange({ player, ...props }: VolumeRangeProps & React.HTMLAttributes<HTMLDivElement>) {
  const volume = useVolumeState();
  const setVolume = useSetVolume();
  const { isMobile } = useUserAgent();

  if (isMobile) return null;

  const handleChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  return (
    <div className="flex items-center gap-4" role="group" aria-label="音量調整" {...props}>
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
