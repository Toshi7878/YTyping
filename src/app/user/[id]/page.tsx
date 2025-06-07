import { serverApi } from "@/trpc/server";
import { notFound } from "next/navigation";
import UserProfileCard from "./UserProfileCard";
import UserStatsCard from "./UserStatsCard";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });
  const userOptions = await serverApi.userOption.getUserOptions({ userId: Number(id) });

  if (!userProfile) {
    return notFound();
  }

  return (
    <div className="mx-auto flex w-[70%] flex-col gap-4 pt-4">
      <UserProfileCard userProfile={userProfile} />
      <UserStatsCard userStats={userStats} userOptions={userOptions} />
    </div>
  );
}
