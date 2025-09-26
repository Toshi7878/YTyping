import { cn } from "@/lib/utils"
import type { RouterOutPuts } from "@/server/api/trpc"

interface InputModeTextProps {
  typeCounts: RouterOutPuts["result"]["usersResultList"]["items"][number]["typeCounts"]
}

export const InputModeText = ({ typeCounts }: InputModeTextProps) => {
  const { kanaType, romaType, flickType, englishType, spaceType, numType, symbolType } = typeCounts

  const colors = {
    roma: "text-roma",
    kana: "text-kana",
    flick: "text-flick",
    english: "text-english",
    other: "text-other",
  }

  const renderText = (label: string, colorClass: string) => (
    <span className={cn(colorClass, "input-mode-outline-text")}>{label}</span>
  )

  const total = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0)

  if (romaType && kanaType) {
    const isRomaFirst = romaType >= kanaType
    const first = isRomaFirst ? { label: "ローマ字", color: colors.roma } : { label: "かな", color: colors.kana }
    const second = isRomaFirst ? { label: "かな", color: colors.kana } : { label: "ローマ字", color: colors.roma }

    return (
      <div className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
        {renderText(first.label, first.color)}
        <span className="text-muted-foreground">・</span>
        {renderText(second.label, second.color)}
      </div>
    )
  }

  const kanaInput = romaType || kanaType
  if (kanaInput && (englishType + spaceType) / total >= 0.1) {
    const inputMode = flickType ? "flick" : romaType >= kanaType ? "roma" : "kana"
    const inputLabel = inputMode === "flick" ? "フリック" : inputMode === "roma" ? "ローマ字" : "かな"

    return (
      <div className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
        {renderText(inputLabel, colors[inputMode])}
        <span className="text-muted-foreground">・</span>
        {renderText("英語", colors.english)}
      </div>
    )
  }

  // その他の入力モードを優先順位順で判定
  if (romaType) return renderText("ローマ字", colors.roma)
  if (kanaType) return renderText("かな", colors.kana)
  if (flickType) return renderText("フリック", colors.flick)
  if (englishType) return renderText("英語", colors.english)
  if (numType || spaceType || symbolType) return renderText("その他", colors.other)

  return null
}
