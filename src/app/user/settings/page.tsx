import { getSession } from "@/server/auth";
import { caller } from "@/trpc/server";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";
import { H2 } from "@/ui/typography";
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
  const session = await getSession();
  if (!session?.user.id) return null;
  const userProfile = await caller.user.profile.get({ userId: session?.user.id });

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
  const userOptions = await caller.user.option.getForSession();

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
