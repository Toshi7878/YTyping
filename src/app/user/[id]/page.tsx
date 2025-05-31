import { serverApi } from "@/trpc/server";
import { notFound } from "next/navigation";
import Content from "./Content";

export default async function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userProfile = await serverApi.user.getUserProfile({ userId: Number(id) });
  const userStats = await serverApi.userStats.getUserStats({ userId: Number(id) });
  const userOptions = await serverApi.userOption.getUserOptions({ userId: Number(id) });

  if (!userProfile) {
    return notFound();
  }

  return <Content userProfile={userProfile} userStats={userStats} userOptions={userOptions} />;
}
