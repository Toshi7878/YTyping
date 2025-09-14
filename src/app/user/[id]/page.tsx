import { serverApi } from "@/trpc/server";
import { notFound } from "next/navigation";
import UserProfileCard from "./_components/UserProfileCard";
import UserStatsCard from "./_components/UserStatsCard";

export default async function Page({ params }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });
  const userOptions = await serverApi.userOption.getUserOptions({ userId: Number(id) });

  if (!userProfile) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-screen-lg space-y-4">
      <UserProfileCard userProfile={userProfile} />
      <UserStatsCard userStats={userStats} userOptions={userOptions} />
    </div>
  );
}
