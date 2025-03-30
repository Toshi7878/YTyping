import { serverApi } from "@/trpc/server";
import Content from "./Content";

export default async function Page() {
  const buildingDate = await serverApi.vercel.getLatestDeployDate();

  return <Content buildingDate={buildingDate} />;
}
