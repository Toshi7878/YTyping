import { Card, CardContent } from "@/components/ui/card";
import { H2, H5, Small } from "@/components/ui/typography";
import { serverApi } from "@/trpc/server";
import { changelog } from "./changelog";

export default async function Page() {
  const buildingDate = await serverApi.vercel.getLatestDeployDate();

  return (
    <article className="mx-auto max-w-screen-xl space-y-4">
      <H2 className="flex items-baseline gap-4">
        更新履歴 <Small>最終更新: {buildingDate?.toLocaleString()}</Small>
      </H2>
      <UpdateHistoryList />
    </article>
  );
}

const UpdateHistoryList = () => {
  return (
    <Card>
      <CardContent className="space-y-6">
        {changelog.map((update, index) => (
          <div key={index} className="space-y-2">
            <H5>{update.date}</H5>
            <ul className="list-disc space-y-2 pl-5">
              {update.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
