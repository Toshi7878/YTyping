import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { ReportList } from "./_features/report-list";

export default async function Page() {
  await prefetchAsync(orpc.user.report.list.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <H1>通報管理</H1>
        <ReportList />
      </div>
    </HydrateClient>
  );
}
