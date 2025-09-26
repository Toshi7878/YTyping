import { usePlayer } from "../atoms/read-atoms"
import { useLineReducer, useReadEditUtils, useReadLine, useSetManyPhrase, useSetWord } from "../atoms/state-atoms"
import { useWordConverter } from "./use-word-converter"

export const usePickupTopPhrase = () => {
  const lineDispatch = useLineReducer()
  const { readPlayer } = usePlayer()
  const readSelectLine = useReadLine()
  const setWordState = useSetWord()
  const readEditUtils = useReadEditUtils()

  const wordConvert = useWordConverter()
  return async (topPhrase: string) => {
    const { directEditingIndex } = readEditUtils()
    if (directEditingIndex !== null) {
      return null
    }

    lineDispatch({
      type: "set",
      line: { lyrics: topPhrase.trim(), word: "", selectIndex: null, time: readPlayer().getCurrentTime() },
    })

    const word = await wordConvert(topPhrase)

    const { lyrics } = readSelectLine()

    if (lyrics === topPhrase) {
      setWordState(word)
    }
  }
}

export const useDeleteTopPhrase = () => {
  const setManyPhrase = useSetManyPhrase()
  const readEditUtils = useReadEditUtils()

  return (lyrics: string) => {
    const { manyPhraseText } = readEditUtils()
    const lines = manyPhraseText.split("\n") || []

    if (lyrics === lines[0].trim()) {
      const newManyPhrase = lines.slice(1).join("\n")

      setManyPhrase(newManyPhrase)
      setTimeout(() => {
        const textarea = document.getElementById("many_phrase_textarea")
        if (textarea) {
          textarea.scrollTop = 0
        }
      })
    }
  }
}
