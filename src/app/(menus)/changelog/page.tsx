import { CardWithContent } from "@/components/ui/card";
import { H1, Large, Small, UList } from "@/components/ui/typography";
import { serverApi } from "@/trpc/server";
import { formatDate } from "@/utils/date";
import { changelog } from "./changelog";

export default async function Page() {
  const buildingDate = await serverApi.vercel.getLatestDeployDate();

  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1 className="flex items-baseline gap-4">
        更新履歴 {buildingDate && <Small>最終更新: {formatDate(buildingDate, "ja-JP")}</Small>}
      </H1>
      <CardWithContent>
        {changelog.map((update) => (
          <div key={update.date}>
            <Large>{update.date}</Large>
            <UList items={update.descriptions} />
          </div>
        ))}
      </CardWithContent>
    </article>
  );
}
