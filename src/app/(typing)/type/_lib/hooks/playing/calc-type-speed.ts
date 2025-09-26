import { useLineStatus, useTypingDetails, useUserStats } from "../../atoms/ref-atoms"
import { useReadTypingStatus, useSetLineKpm, useSetTypingStatus } from "../../atoms/state-atoms"

type UpdateType = "keydown" | "completed" | "timer" | "lineUpdate"
export const useCalcTypeSpeed = () => {
  const { readLineStatus } = useLineStatus()

  const readTypingStatus = useReadTypingStatus()
  const setLineKpm = useSetLineKpm()
  const { writeLineStatus } = useLineStatus()
  const { setTypingStatus } = useSetTypingStatus()
  const { readStatus, writeStatus } = useTypingDetails()
  const { readUserStats, writeUserStats } = useUserStats()

  const calcLineKpm = ({ constantLineTime }) => {
    const { type: lineTypeCount } = readLineStatus()

    const lineKpm = constantLineTime ? Math.floor((lineTypeCount / constantLineTime) * 60) : 0
    setLineKpm(lineKpm)
    return lineKpm
  }

  const calcLineRkpm = ({ lineKpm, constantLineTime }) => {
    const { latency: lineLatency } = readLineStatus()
    const { type: lineTypeCount } = readLineStatus()

    const rkpmTime = constantLineTime - lineLatency
    const lineRkpm = lineTypeCount !== 0 ? Math.floor((lineTypeCount / rkpmTime) * 60) : lineKpm
    writeLineStatus({ rkpm: lineRkpm })
  }

  const calcTotalKpm = ({ constantLineTime }: { constantLineTime: number }) => {
    const { type: totalTypeCount } = readTypingStatus()
    const { totalTypeTime } = readStatus()

    const newTotalTypeTime = totalTypeTime + constantLineTime

    const totalKpm = Math.floor((totalTypeCount / newTotalTypeTime) * 60)
    setTypingStatus((prev) => ({ ...prev, kpm: totalKpm }))
  }

  return ({ updateType, constantLineTime }: { updateType: UpdateType; constantLineTime: number }) => {
    const lineKpm = calcLineKpm({ constantLineTime })

    if (updateType === "timer") {
      return
    }

    calcTotalKpm({ constantLineTime })

    if (updateType === "keydown") {
      return
    }

    if (updateType === "lineUpdate" || updateType === "completed") {
      writeStatus({
        totalTypeTime: readStatus().totalTypeTime + constantLineTime,
      })

      if (readLineStatus().type !== 0) {
        writeUserStats({
          typingTime: readUserStats().typingTime + constantLineTime,
        })
      }
      calcLineRkpm({ lineKpm, constantLineTime })
    }
  }
}
