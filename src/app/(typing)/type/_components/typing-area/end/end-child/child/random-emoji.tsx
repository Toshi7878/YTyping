import { memo, useCallback } from "react"

const HAPPY_EMOJI = [
  "((o(｡>ω<｡)o))",
  "(◍>ᴗ<◍)",
  "＞ ω ＜ﾉ",
  "(*>ᴗ<*)",
  "(๑>◡<๑)",
  "(˶ ᵔ ᵕ ᵔ ˶)",
  "꜆＞⩊＜꜀",
  "ฅ^ ̳>𖥦< ̳^ฅ",
  "˶>ᴗ<˶",
  "⌯>ᴗ<⌯",
  "^›⩊‹^",
  "(^> ·̮ <^)✩",
  "＞⩊＜",
  ">⩊<",
  "＞ω＜",
  "ฅ^›⩊‹^ฅ",
  "(๑ > ◡ < ๑)",
  "ヽ(｡>▽<｡)ﾉ",
  `"(∩>ω<∩)"`,
  "٩(๑>∀<๑)و",
  "⸜(*´꒳`*)⸝",
  "ฅ(*´꒳`*ฅ",
  ">ω</ﾐ",
  "^> ·̫ <^◝✩",
  "(｡>∀<｡)",
  "(>ω<)",
  "(＞⩊＜)",
]

const RandomEmoji = () => {
  const getRandomEmoji = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * HAPPY_EMOJI.length)
    return HAPPY_EMOJI[randomIndex]
  }, [])

  return <span className="font-sans">{getRandomEmoji()}</span>
}

export default memo(RandomEmoji)
