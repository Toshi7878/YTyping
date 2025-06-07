import { UserNameInputForm } from "@/app/user/_components/UserNameInputForm";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RouterOutPuts } from "@/server/api/trpc";
import { FingerChartUrlInput } from "./profile-input/FingerChartUrlInput";
import { MyKeyboardInput } from "./profile-input/MyKeyboardInput";

interface ProfileSettingCardProps {
  userProfile: RouterOutPuts["user"]["getUserProfile"];
}

const ProfileSettingCard = ({ userProfile }: ProfileSettingCardProps) => {
  return (
    <Card className="mx-8">
      <CardHeader>
        <h3 className="text-lg font-medium">プロフィール設定</h3>
      </CardHeader>
      <CardContent>
        <div className="flex w-full flex-col gap-4">
          <UserNameInputForm />
          <FingerChartUrlInput url={userProfile?.user_profiles?.[0]?.finger_chart_url ?? ""} />
          <MyKeyboardInput myKeyboard={userProfile?.user_profiles?.[0]?.my_keyboard ?? ""} />
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};

export default ProfileSettingCard;
