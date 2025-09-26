import { useUserTypingOptionsStateRef } from "../../../type/_lib/atoms/state-atoms"
import { usePlayer } from "../atoms/read-atoms"

export const useGetYouTubeTime = () => {
  const { readPlayer } = usePlayer()
  const readTypingOptions = useUserTypingOptionsStateRef()

  const getCurrentOffsettedYTTime = () => {
    const typingOptions = readTypingOptions()
    const result = readPlayer().getCurrentTime() - typingOptions.timeOffset
    return result
  }

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime
  }

  return {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
  }
}
