"use client";
import { usePlayer } from "@/app/edit/atoms/refAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { HStack, VStack } from "@chakra-ui/react";
import AllTimeAdjust from "./settings-child/AllTimeAdjust";
import ConvertOptionButtons from "./settings-child/ConvertOptionButtons";
import LrcConvertButton from "./settings-child/LrcConvertButton";

export default function EditSettings() {
  const { readPlayer } = usePlayer();
  return (
    <VStack align="start" spacing={4}>
      <HStack spacing={10} alignItems="flex-end">
        <AllTimeAdjust />
        {!IS_IOS && !IS_ANDROID && <VolumeRange player={readPlayer()} />}
      </HStack>
      <HStack spacing={10} alignItems="flex-end">
        <ConvertOptionButtons />
        <LrcConvertButton />
      </HStack>
    </VStack>
  );
}
