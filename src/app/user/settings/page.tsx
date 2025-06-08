import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { RouterOutPuts } from "@/server/api/trpc";
import { auth } from "@/server/auth";
import { serverApi } from "@/trpc/server";
import { UserNameInputForm } from "../_components/UserNameInputForm";
import { OptionSettingForm } from "./_components/option-settings/OptionSettingForm";
import { FingerChartUrlInput } from "./_components/profile-settings/FingerChartUrlInput";
import { MyKeyboardInput } from "./_components/profile-settings/MyKeyboardInput";

export default async function Page() {
  const session = await auth();
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(session?.user.id) });
  const userOptions = await serverApi.userOption.getUserOptions({ userId: Number(session?.user.id) });

  return (
    <div className="mx-auto flex w-full flex-col gap-5 pt-4 md:w-[70%]">
      <ProfileSettingCard userProfile={userProfile} />
      <OptionSettingCard userOptions={userOptions} />
    </div>
  );
}

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

interface OptionSettingCardProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const OptionSettingCard = ({ userOptions }: OptionSettingCardProps) => {
  return (
    <Card className="mx-8">
      <CardHeader>
        <h3 className="text-lg font-medium" id="user-settings">
          ユーザー設定
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex w-full">
          <OptionSettingForm userOptions={userOptions} />
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};
