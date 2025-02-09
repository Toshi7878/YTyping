import { serverApi } from "@/trpc/server";
import Content from "./Content";

export default async function Home() {
  const userOptions = await serverApi.userOption.getUserOptions();

  return <Content userOptions={userOptions} />;
}
