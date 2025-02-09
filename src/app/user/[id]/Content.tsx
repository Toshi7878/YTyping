"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Stack, Text } from "@chakra-ui/react";
import nProgress from "nprogress";
import { useEffect } from "react";
import UserStatsCard from "./_components/user-stats/UserStatsCard";
import UserCard from "./_components/user/UserCard";

interface ContentProps {
  user: RouterOutPuts["user"]["getUser"];
  userStats: RouterOutPuts["userStats"]["getUserStats"];
}

const Content = ({ user, userStats }: ContentProps) => {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, []);

  if (!user) {
    return (
      <Stack
        width={{ base: "100%", md: "70%" }}
        spacing={4}
        pt={4}
        align="center"
        justify="center"
        minHeight="200px"
      >
        <Text fontSize="xl">ユーザーが存在しません</Text>
      </Stack>
    );
  }

  return (
    <Stack width={{ base: "100%", md: "70%" }} spacing={4} pt={4}>
      <UserCard user={user} />
      <UserStatsCard userStats={userStats} />
    </Stack>
  );
};

export default Content;
