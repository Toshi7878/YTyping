import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H1 } from "@/components/ui/typography";
import { serverApi } from "@/trpc/server";
import { UserCreatedMapList } from "./_components/user-created-map-list";
import { UserProfileCard } from "./_components/user-profile-card";
import { UserStatsCard } from "./_components/user-stats-card";

export default async function Page({ params }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });

  const tabs = [
    {
      label: "制作譜面",
      value: "maps",
    },
    {
      label: "タイピング統計情報",
      value: "stats",
    },
  ];

  return (
    <div className="mx-auto max-w-screen-lg space-y-4">
      <H1>プレイヤー情報</H1>
      <UserProfileCard userProfile={userProfile} />

      <Tabs>
        <TabsList variant="underline" className="w-full">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} variant="underline">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="maps">
          <UserCreatedMapList />
        </TabsContent>
        <TabsContent value="stats">
          <UserStatsCard userStats={userStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
