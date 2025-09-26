import { Ticker } from "@pixi/ticker"
import { useReadMap } from "../atoms/map-reducer-atom"
import { usePlayer, useTimeInput } from "../atoms/read-atoms"
import {
  useReadEditUtils,
  useSetIsTimeInputValid,
  useSetTimeLineIndex,
  useSetTimeRangeValue,
} from "../atoms/state-atoms"

const editTicker = new Ticker()

export const useTimerRegistration = () => {
  const editTimer = useTimer()

  const addTimer = () => {
    editTicker.add(editTimer)
  }

  const removeTimer = () => {
    editTicker.stop()
    editTicker.remove(editTimer)
  }

  return { addTimer, removeTimer }
}
export const useTimerControls = () => {
  const setIsTimeInputValid = useSetIsTimeInputValid()

  const startTimer = () => {
    if (!editTicker.started) {
      editTicker.start()
      setIsTimeInputValid(false)
    }
  }

  const pauseTimer = () => {
    if (editTicker.started) {
      editTicker.stop()
    }
  }

  return { startTimer, pauseTimer }
}

const useTimer = () => {
  const setTimeLineIndex = useSetTimeLineIndex()
  const readEditUtils = useReadEditUtils()

  const { setTime } = useTimeInput()
  const { readPlayer } = usePlayer()
  const readMap = useReadMap()
  const setTimeRangeValue = useSetTimeRangeValue()

  return () => {
    const currentTime = Number(readPlayer().getCurrentTime().toFixed(3))

    setTimeRangeValue(currentTime)

    const { directEditingIndex, timeLineIndex } = readEditUtils()
    if (!directEditingIndex) {
      setTime(currentTime)
    }

    const nextLineIndex = timeLineIndex + 1

    const map = readMap()
    const nextLine = map[nextLineIndex]
    if (nextLine && Number(currentTime) >= Number(nextLine.time)) {
      setTimeLineIndex(nextLineIndex)
    }
  }
}
