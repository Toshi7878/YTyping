import { auth } from "@/server/auth";
import { serverApi } from "@/trpc/server";
import OptionSettingCard from "./_components/option-settings/OptionSettingCard";
import ProfileSettingCard from "./_components/profile-settings/ProfileSettingCard";

export default async function Home() {
  const session = await auth();
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(session?.user.id) });

  return (
    <div className="mx-auto flex w-full flex-col gap-5 pt-4 md:w-[70%]">
      <ProfileSettingCard userProfile={userProfile} />
      <OptionSettingCard />
    </div>
  );
}
