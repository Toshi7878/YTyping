import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { H4 } from "@/components/ui/typography";
import { auth } from "@/server/auth";
import { serverApi } from "@/trpc/server";
import { UserNameInputForm } from "../_components/UserNameInputForm";
import { OptionForm } from "./_components/option/OptionForm";
import { FingerChartUrlInput } from "./_components/profile-settings/FingerChartUrlInput";
import { KeyboardInput } from "./_components/profile-settings/keyboardInput";

export default async function Page() {
  return (
    <div className="mx-auto max-w-screen-lg space-y-5">
      <ProfileSettingCard />
      <OptionSettingCard />
    </div>
  );
}

const ProfileSettingCard = async () => {
  const session = await auth();
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(session?.user.id) });

  return (
    <Card className="mx-8">
      <CardHeader>
        <H4>プロフィール設定</H4>
      </CardHeader>
      <CardContent>
        <div className="flex w-full flex-col gap-4">
          <UserNameInputForm />
          <FingerChartUrlInput url={userProfile?.fingerChartUrl ?? ""} />
          <KeyboardInput keyboard={userProfile?.keyboard ?? ""} />
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};

const OptionSettingCard = async () => {
  const userOptions = await serverApi.userOption.getUserOptions();

  return (
    <Card className="mx-8">
      <CardHeader>
        <H4 id="user-settings">ユーザー設定</H4>
      </CardHeader>
      <CardContent>
        <div className="flex w-full">
          <OptionForm userOptions={userOptions} />
        </div>
      </CardContent>
      <CardFooter />
    </Card>
  );
};
