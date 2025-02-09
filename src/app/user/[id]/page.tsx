import { serverApi } from "@/trpc/server";
import Content from "./Content";

export default async function Home({ params }: { params: { id: string } }) {
  const user = await serverApi.user.getUser({ userId: Number(params.id) });
  const userStats = await serverApi.userStats.getUserStats();

  return <Content user={user} userStats={userStats} />;
}
