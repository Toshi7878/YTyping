import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { ImportantNoticeList } from "./_features/important-notice-list";

export default async function Page() {
  await prefetchAsync(orpc.importantNotice.list.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <H1>重要なお知らせ管理</H1>
        <ImportantNoticeList />
      </div>
    </HydrateClient>
  );
}
