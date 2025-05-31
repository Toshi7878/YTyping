"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import UserStatsCard from "./_components/user-stats/UserStatsCard";
import UserProfileCard from "./_components/user/UserProfileCard";

interface ContentProps {
  userProfile: NonNullable<RouterOutPuts["user"]["getUserProfile"]>;
  userStats: RouterOutPuts["userStats"]["getUserStats"];
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const Content = ({ userProfile, userStats, userOptions }: ContentProps) => {
  return (
    <div className="w-[70%] mx-auto pt-4 flex flex-col gap-4">
      <UserProfileCard userProfile={userProfile} />
      <UserStatsCard userStats={userStats} userOptions={userOptions} />
    </div>
  );
};

export default Content;
