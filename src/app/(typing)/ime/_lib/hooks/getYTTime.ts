import { useUserTypingOptionsStateRef } from "../../../type/_lib/atoms/stateAtoms";
import { usePlayer } from "../atoms/refAtoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const readTypingOptions = useUserTypingOptionsStateRef();

  const getCurrentOffsettedYTTime = () => {
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime;
  };

  return {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
  };
};
