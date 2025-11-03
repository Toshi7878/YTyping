import { usePlayer } from "../atoms/read-atoms";

export const useGetYouTubeTime = () => {
  const { readPlayer } = usePlayer();

  const getCurrentOffsettedYTTime = () => {
    const result = readPlayer().getCurrentTime();
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
