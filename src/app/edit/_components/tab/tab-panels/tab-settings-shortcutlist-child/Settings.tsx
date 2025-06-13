"use client";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { useUserAgent } from "@/utils/useUserAgent";
import AllTimeAdjust from "./settings-child/AllTimeAdjust";
import ConvertOptionButtons from "./settings-child/ConvertOptionButtons";
import LrcConvertButton from "./settings-child/LrcConvertButton";

export default function EditSettings() {
  const { readPlayer } = usePlayer();
  const { isMobile } = useUserAgent();
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex gap-10 items-end">
        <AllTimeAdjust />
        {!isMobile && <VolumeRange player={readPlayer()} />}
      </div>
      <div className="flex gap-10 items-end">
        <ConvertOptionButtons />
        <LrcConvertButton />
      </div>
    </div>
  );
}
