"use client";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { HStack, VStack } from "@chakra-ui/react";
import ConvertOptionButtons from "./settings-child/ConvertOptionButtons";
import LrcConvertButton from "./settings-child/LrcConvertButton";
import TotalTimeAdjust from "./settings-child/TotalTimeAdjust";

export default function EditSettings() {
  const { playerRef } = useRefs();

  return (
    <VStack align="start" spacing={4}>
      <HStack spacing={10} alignItems="flex-end">
        <TotalTimeAdjust />
        {!IS_IOS && !IS_ANDROID && <VolumeRange player={playerRef.current!} />}
      </HStack>
      <HStack spacing={10} alignItems="flex-end">
        <ConvertOptionButtons />
        <LrcConvertButton />
      </HStack>
    </VStack>
  );
}
