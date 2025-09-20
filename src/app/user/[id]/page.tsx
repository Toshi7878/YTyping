import { serverApi } from "@/trpc/server";
import UserProfileCard from "./_components/UserProfileCard";
import UserStatsCard from "./_components/UserStatsCard";

export default async function Page({ params }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });

  return (
    <div className="mx-auto max-w-screen-lg space-y-4">
      <UserProfileCard userProfile={userProfile} />
      <UserStatsCard userStats={userStats} />
    </div>
  );
}
