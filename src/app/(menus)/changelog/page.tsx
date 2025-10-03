import { CardWithContent } from "@/components/ui/card";
import { H1, Large, Small, UList } from "@/components/ui/typography";
import { serverApi } from "@/trpc/server";
import { changelog } from "./changelog";

export default async function Page() {
  const buildingDate = await serverApi.vercel.getLatestDeployDate();

  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H1 className="flex items-baseline gap-4">
        更新履歴 <Small>最終更新: {buildingDate?.toLocaleString()}</Small>
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
