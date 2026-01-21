import { serverApi } from "@/trpc/server";
import { JotaiProvider } from "./provider";

// biome-ignore lint/style/noDefaultExport: デフォルトエクスポートを使用する
export default async function Template({ children }: { children: React.ReactNode }) {
  const userOptions = await serverApi.user.option.getForSession();

  return <JotaiProvider userOptions={userOptions}>{children}</JotaiProvider>;
}
