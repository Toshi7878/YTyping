import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { H1 } from "@/components/ui/typography";
import { HydrateClient, serverApi } from "@/trpc/server";
import { UserCreatedMapList, UserLikedMapList } from "./_components/user-map-list";
import { UserProfileCard } from "./_components/user-profile-card";
import { UserStatsCard } from "./_components/user-stats-card";

const tabs = [
  {
    label: "タイピング統計情報",
    value: "stats",
  },
  {
    label: "制作譜面",
    value: "maps",
  },
  {
    label: "いいねした譜面",
    value: "liked",
  },
];
export default async function Page({ params }: PageProps<"/user/[id]">) {
  const { id } = await params;
  const userProfile = await serverApi.userProfile.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });

  return (
    <HydrateClient>
      <div className="mx-auto max-w-screen-lg space-y-4">
        <H1>プレイヤー情報</H1>
        <UserProfileCard userProfile={userProfile} />

        <Tabs defaultValue="stats">
          <TabsList variant="underline" className="w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} variant="underline">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="stats">
            <UserStatsCard userStats={userStats} />
          </TabsContent>
          <TabsContent value="maps">
            <UserCreatedMapList id={id} />
          </TabsContent>
          <TabsContent value="liked">
            <UserLikedMapList id={id} />
          </TabsContent>
        </Tabs>
      </div>
    </HydrateClient>
  );
}
