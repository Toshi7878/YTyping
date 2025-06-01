"use client";
import { useSetVolume, useVolumeState } from "@/lib/global-atoms/globalAtoms";
import { YTPlayer } from "@/types/global-types";
import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeMute } from "react-icons/io";
import { Slider } from "../ui/slider";

interface VolumeRangeProps {
  player: YTPlayer | null;
}

export default function VolumeRange({ player, ...props }: VolumeRangeProps & React.HTMLAttributes<HTMLDivElement>) {
  const volume = useVolumeState();
  const setVolume = useSetVolume();

  const handleChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  return (
    <div className="flex items-center" {...props}>
      <VolumeIcon volume={volume} />

      <div className="ml-4 w-[200px]">
        <Slider
          defaultValue={[volume]}
          value={[volume]}
          onValueChange={handleChange}
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}

const VolumeIcon = ({ volume }: { volume: number }) => {
  return (
    <div>
      {volume === 0 ? (
        <IoMdVolumeMute size={24} />
      ) : volume < 50 ? (
        <IoMdVolumeLow size={24} />
      ) : (
        <IoMdVolumeHigh size={24} />
      )}
    </div>
  );
};
