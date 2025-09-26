import { useMapReducer, useReadMap } from "../atoms/map-reducer-atom"

export const useUpdateEndTime = () => {
  const readMap = useReadMap()
  const mapDispatch = useMapReducer()

  return (player: YT.Player) => {
    const duration = player.getDuration()
    if (!duration) return

    const map = readMap()
    const endLineIndex = map.findLastIndex((item) => item.lyrics === "end")
    const endLine = {
      time: duration.toFixed(3),
      lyrics: "end",
      word: "",
    }

    if (endLineIndex === -1) {
      mapDispatch({ type: "add", payload: endLine })
    } else {
      mapDispatch({ type: "update", payload: endLine, index: endLineIndex })
    }
  }
}
