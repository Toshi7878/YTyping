"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Stack, Text } from "@chakra-ui/react";
import UserStatsCard from "./_components/user-stats/UserStatsCard";
import UserProfileCard from "./_components/user/UserProfileCard";

interface ContentProps {
  userProfile: RouterOutPuts["user"]["getUserProfile"];
  userStats: RouterOutPuts["userStats"]["getUserStats"];
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const Content = ({ userProfile, userStats, userOptions }: ContentProps) => {
  if (!userProfile) {
    return (
      <Stack width={{ base: "100%", md: "70%" }} spacing={4} pt={4} align="center" justify="center" minHeight="200px">
        <Text fontSize="xl">ユーザーが存在しません</Text>
      </Stack>
    );
  }

  return (
    <Stack width={{ base: "100%", md: "70%" }} spacing={4} pt={4}>
      <UserProfileCard userProfile={userProfile} />
      <UserStatsCard userStats={userStats} userOptions={userOptions} />
    </Stack>
  );
};

export default Content;
