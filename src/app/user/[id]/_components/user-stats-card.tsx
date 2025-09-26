"use client"
import { formatDistanceToNowStrict } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import type { ReactNode } from "react"
import { GoLock } from "react-icons/go"
import { IoMdInformationCircleOutline } from "react-icons/io"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { H3 } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { RouterOutPuts } from "@/server/api/trpc"
import TypeActivity from "./user-stats/type-activity"

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}時間 ${minutes}分 ${seconds.toFixed()}秒`
}

interface UserStatsProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"]
}

const UserStatsCard = ({ userStats }: UserStatsProps) => {
  const { id: userId } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const userSearchParams = useSearchParams()
  const isHidePreview = userSearchParams.get("hidePreview") === "true"
  const isHideUserStats = userStats?.options?.hideUserStats ?? false
  const isMyStats = session?.user?.id === userId
  const isMyStatsWithHide = isMyStats && isHideUserStats

  return (
    <Card>
      <CardHeader className="mx-8 flex flex-col items-center">
        <CardTitle className="mb-2 text-2xl">タイピング統計情報</CardTitle>
        <Badge variant="secondary" className="text-sm">
          統計情報はやり直し時・ページ離脱時・リザルト時に更新されます
        </Badge>
      </CardHeader>
      <CardContent className="mx-8">
        {(isHideUserStats && !isMyStats) || isHidePreview ? (
          <HideUserStats isMyStatsWithHide={isMyStatsWithHide} />
        ) : (
          <UserStatsContent userStats={userStats} isMyStatsWithHide={isMyStatsWithHide} />
        )}
      </CardContent>
      <CardFooter className="mx-8" />
    </Card>
  )
}

interface UserStatsContentProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"]
  isMyStatsWithHide: boolean
}

const UserStatsContent = ({ userStats, isMyStatsWithHide }: UserStatsContentProps) => {
  if (!userStats) {
    return <div>データがありません</div>
  }
  const { typeCounts } = userStats

  const totalKeystrokes = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0)

  const keystrokeStatsData = [
    { label: "ローマ字 打鍵数", value: typeCounts.romaTypeTotalCount },
    { label: "かな入力 打鍵数", value: typeCounts.kanaTypeTotalCount },
    { label: "英語 打鍵数", value: typeCounts.englishTypeTotalCount },
    { label: "スペース 打鍵数", value: typeCounts.spaceTypeTotalCount },
    { label: "数字 打鍵数", value: typeCounts.numTypeTotalCount },
    { label: "記号 打鍵数", value: typeCounts.symbolTypeTotalCount },
    { label: "フリック 打鍵数", value: typeCounts.flickTypeTotalCount },
    { label: "変換有り 打鍵数", value: typeCounts.imeTypeTotalCount },
    { label: "合計 打鍵数", value: totalKeystrokes },
  ]

  const generalStatsData = [
    {
      label: "計測開始日",
      value: (
        <div className="flex items-center gap-2">
          <span>{userStats.createdAt.toLocaleDateString()}</span>
          <span className="text-muted-foreground text-sm">
            ({formatDistanceToNowStrict(userStats.createdAt, { addSuffix: true, locale: ja })})
          </span>
        </div>
      ),
    },
    { label: "タイピング時間", value: formatTime(userStats.totalTypingTime) },
    { label: "プレイ回数", value: userStats.totalPlayCount },
    { label: "最大コンボ", value: userStats.maxCombo },
  ]

  return (
    <div className="flex flex-col gap-4">
      {isMyStatsWithHide && <MyHideOptionInfo />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {generalStatsData.map((item, index) => (
          <StatsCard key={index} label={item.label} value={item.value} />
        ))}
      </div>

      <H3>打鍵情報</H3>

      <TypeActivity />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keystrokeStatsData.map((item, index) => (
          <StatsCard key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  )
}

const StatsCard = ({ label, value }: { label: string; value: string | number | ReactNode }) => {
  return (
    <Card className="bg-background border-accent-foreground/50 gap-1 rounded-sm border py-4 pl-8">
      <CardTitle className="text-lg font-normal">{label}</CardTitle>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  )
}

const HideUserStats = ({ isMyStatsWithHide }: { isMyStatsWithHide: boolean }) => {
  return (
    <div>
      {isMyStatsWithHide && <MyHideOptionInfo />}
      <div className="flex flex-col items-center justify-center gap-4">
        <GoLock size={30} />
        <p>タイピング統計情報は非公開にしています</p>
      </div>
    </div>
  )
}

const MyHideOptionInfo = () => {
  const userSearchParams = useSearchParams()
  const isHidePreview = userSearchParams.get("hidePreview") === "true"
  const { id: userId } = useParams<{ id: string }>()

  return (
    <InfoCard title="統計情報は非公開に設定されています" className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p>現在プロフィールは自分のみが閲覧できます</p>
          {!isHidePreview ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="?hidePreview=true">他の人が見ているページを見る</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/user/${userId}`}>統計情報を表示</Link>
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link href="/user/settings#user-settings">設定を変更</Link>
          </Button>
        </div>
      </div>
    </InfoCard>
  )
}

interface InfoCardProps {
  title: string
  children: ReactNode
  className?: string
}

const InfoCard = ({ title, children, className }: InfoCardProps) => {
  return (
    <Card className={cn("border-primary bg-primary/50", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <IoMdInformationCircleOutline size={20} className="text-primary-foreground" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

export default UserStatsCard
