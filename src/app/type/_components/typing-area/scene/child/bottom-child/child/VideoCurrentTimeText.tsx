import { useCurrentTimeSSMMAtom } from "@/app/type/atoms/stateAtoms";
import { formatTime } from "@/app/type/ts/scene-ts/playing/formatTime";
import { Text } from "@chakra-ui/react";

const VideoCurrentTimeText = () => {
  const currentTimeSSMM = useCurrentTimeSSMMAtom();

  return (
    <Text as="span" id="current_time">
      {formatTime(currentTimeSSMM)}
    </Text>
  );
};

export default VideoCurrentTimeText;
