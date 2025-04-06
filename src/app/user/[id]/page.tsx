import { serverApi } from "@/trpc/server";
import Content from "./Content";

export default async function Home({ params }: { params: { id: string } }) {
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(params.id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(params.id) });
  const userOptions = await serverApi.userOption.getUserOptions({ userId: Number(params.id) });

  return <Content userProfile={userProfile} userStats={userStats} userOptions={userOptions} />;
}
