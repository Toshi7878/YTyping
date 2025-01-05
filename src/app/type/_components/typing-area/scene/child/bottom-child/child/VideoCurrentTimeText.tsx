import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { useCurrentTimeSSMMAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Text } from "@chakra-ui/react";
import React from "react";

const VideoCurrentTimeText = () => {
  const currentTimeSSMM = useCurrentTimeSSMMAtom();

  return (
    <Text as="span" id="current_time">
      {formatTime(currentTimeSSMM)}
    </Text>
  );
};

export default VideoCurrentTimeText;
