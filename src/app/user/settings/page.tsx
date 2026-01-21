import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { H2 } from "@/components/ui/typography";
import { auth } from "@/server/auth";
import { serverApi } from "@/trpc/server";
import { UserNameInputForm } from "../_components/user-name-input-form";
import { UserOptionsForm } from "./_components/option-form";
import { FingerChartUrlInput } from "./_components/profile-settings/finger-chart-url-input";
import { KeyboardInput } from "./_components/profile-settings/keyboard-input";

export default async function Page() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <ProfileSettingCard />
      <OptionSettingCard />
    </div>
  );
}

const ProfileSettingCard = async () => {
  const session = await auth();
  const userProfile = await serverApi.user.profile.get({ userId: Number(session?.user.id) });

  return (
    <Card className="mx-8">
      <CardHeader>
        <H2>プロフィール設定</H2>
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
  const userOptions = await serverApi.user.option.getForSession();

  return (
    <Card className="mx-8">
      <CardHeader>
        <H2 id="user-settings">ユーザー設定</H2>
      </CardHeader>
      <CardContent className="flex w-full">
        <UserOptionsForm userOptions={userOptions} />
      </CardContent>
      <CardFooter />
    </Card>
  );
};
