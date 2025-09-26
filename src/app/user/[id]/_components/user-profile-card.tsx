"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { MdOutlineEdit } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TooltipWrapper } from "@/components/ui/tooltip"
import { H3 } from "@/components/ui/typography"
import type { RouterOutPuts } from "@/server/api/trpc"
import FingerChartUrl from "./user-info/finger-chart-url"
import KeyBoard from "./user-info/usage-keyboard"

interface UserProfileCardProps {
  userProfile: RouterOutPuts["userProfile"]["getUserProfile"]
}

const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const { id: userId } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const myProfile = session?.user.id === userId

  return (
    <Card>
      <CardHeader className="mx-8">
        <CardTitle className="text-lg">ユーザー情報</CardTitle>
      </CardHeader>

      <CardContent className="mx-8">
        <div className="space-y-4">
          <H3>{userProfile?.name ?? ""}</H3>
          <FingerChartUrl url={userProfile?.fingerChartUrl ?? ""} />
          <KeyBoard keyboard={userProfile?.keyboard ?? ""} />
        </div>
      </CardContent>

      <CardFooter className="mx-8 justify-end">
        {myProfile && (
          <TooltipWrapper label="プロフィール編集ページに移動">
            <Button variant="outline" size="icon" asChild>
              <Link href="/user/settings">
                <MdOutlineEdit className="h-4 w-4" />
                <span className="sr-only">編集</span>
              </Link>
            </Button>
          </TooltipWrapper>
        )}
      </CardFooter>
    </Card>
  )
}

export default UserProfileCard
