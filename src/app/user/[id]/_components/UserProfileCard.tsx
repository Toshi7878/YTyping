"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MdOutlineEdit } from "react-icons/md";
import FingerChartUrl from "./user-info/FingerChartUrl";
import MyKeyBoard from "./user-info/MyKeyboard";

interface UserProfileCardProps {
  userProfile: NonNullable<RouterOutPuts["user"]["getUserProfile"]>;
}

const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const { id: userId } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const myProfile = session?.user.id === userId;

  return (
    <Card>
      <CardHeader className="mx-8">
        <CardTitle className="text-lg">ユーザー情報</CardTitle>
      </CardHeader>

      <CardContent className="mx-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{userProfile.name}</h3>
          <FingerChartUrl url={userProfile.user_profiles[0].finger_chart_url} />
          <MyKeyBoard myKeyboard={userProfile.user_profiles[0].my_keyboard} />
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
  );
};

export default UserProfileCard;
