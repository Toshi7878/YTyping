import { useUserTypingOptionsStateRef } from "../../type/atoms/stateAtoms";
import { usePlayer } from "../atom/refAtoms";
import { useReadPlaySpeed } from "../atom/speedReducerAtoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const readPlaySpeed = useReadPlaySpeed();
  const readTypingOptions = useUserTypingOptionsStateRef();

  const getCurrentOffsettedYTTime = () => {
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.time_offset;
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
