import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { ResultReportList } from "./_features/result-report-list";

export default async function Page() {
  await prefetchAsync(orpc.result.report.list.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <H1>記録通報管理</H1>
        <ResultReportList />
      </div>
    </HydrateClient>
  );
}
