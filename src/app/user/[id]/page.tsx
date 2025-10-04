import { H1 } from "@/components/ui/typography";
import { serverApi } from "@/trpc/server";
import { UserProfileCard } from "./_components/user-profile-card";
import { UserTabs } from "./_components/user-tabs";

export default async function Page({ params }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(id) });

  return (
    <div className="mx-auto max-w-screen-lg space-y-4">
      <H1>プレイヤー情報</H1>
      <UserProfileCard userProfile={userProfile} />
      <UserTabs id={id} />
    </div>
  );
}
