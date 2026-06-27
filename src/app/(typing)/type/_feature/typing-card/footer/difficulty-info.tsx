"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useReadyInputMode } from "@/store/ready-input-mode";
import { useTRPC } from "@/trpc/provider";
import { useMinMediaSpeedState } from "../../youtube/youtube-player";

export const DifficultyInfo = () => {
  const trpc = useTRPC();
  const { id: mapId } = useParams();
  const { data: mapInfo } = useQuery(trpc.map.getById.queryOptions({ mapId: Number(mapId) }));
  const inputMode = useReadyInputMode();
  const minMediaSpeed = useMinMediaSpeedState();

  const difficulty = mapInfo?.difficulty;
  if (!difficulty) return null;

  const isRoma = inputMode === "roma";
  const medianKpm = Math.round((isRoma ? difficulty.romaKpmMedian : difficulty.kanaKpmMedian) * minMediaSpeed);
  const maxKpm = Math.round((isRoma ? difficulty.romaKpmMax : difficulty.kanaKpmMax) * minMediaSpeed);

  return (
    <div className="flex items-center gap-6 opacity-70">
      <span>中央値kpm: {medianKpm}</span>
      <span>最大kpm: {maxKpm}</span>
    </div>
  );
};
