import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MdOutlineEdit } from "react-icons/md";
import FingerChartUrl from "./child/FingerChartUrl";
import MyKeyBoard from "./child/MyKeyboard";

interface UserProfileCardProps {
  userProfile: NonNullable<RouterOutPuts["user"]["getUserProfile"]>;
}

const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const handleLinkClick = useLinkClick();
  const { id: userId } = useParams() as { id: string };
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
          <FingerChartUrl url={userProfile.user_profiles?.[0]?.finger_chart_url ?? ""} />
          <MyKeyBoard myKeyboard={userProfile.user_profiles?.[0]?.my_keyboard ?? ""} />
        </div>
      </CardContent>

      <CardFooter className="mx-8 justify-end">
        {myProfile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" asChild>
                  <Link href="/user/settings" onClick={handleLinkClick}>
                    <MdOutlineEdit className="h-4 w-4" />
                    <span className="sr-only">編集</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">プロフィール編集ページに移動</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserProfileCard;
