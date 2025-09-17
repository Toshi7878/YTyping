import { useUserTypingOptionsStateRef } from "../../../type/_lib/atoms/stateAtoms";
import { usePlayer } from "../atoms/refAtoms";
import { useReadPlaySpeed } from "../atoms/speedReducerAtoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const readPlaySpeed = useReadPlaySpeed();
  const readTypingOptions = useUserTypingOptionsStateRef();

  const getCurrentOffsettedYTTime = () => {
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / readPlaySpeed().playSpeed;
  };

  return {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
  };
};
