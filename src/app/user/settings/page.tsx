import { auth } from "@/server/auth";
import { serverApi } from "@/trpc/server";
import Content from "./Content";

export default async function Home() {
  const session = await auth();
  const userOptions = await serverApi.userOption.getUserOptions();

  const userProfile = await serverApi.user.getUserProfile({ userId: Number(session?.user.id) });

  return <Content userOptions={userOptions} userProfile={userProfile} />;
}
