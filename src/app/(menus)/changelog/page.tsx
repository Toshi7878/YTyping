import { serverApi } from "@/trpc/server";
import { changelog } from "./changelog";

export default async function Page() {
  const buildingDate = await serverApi.vercel.getLatestDeployDate();

  return (
    <article className="flex flex-col gap-4">
      <p className="text-sm">最終更新: {buildingDate?.toLocaleString()}</p>
      <h1>更新履歴</h1>
      <UpdateHistoryList />
    </article>
  );
}

const UpdateHistoryList = () => {
  return (
    <div>
      {changelog.map((update, index) => (
        <div key={index} className="mb-4 gap-2">
          <p className="font-bold">{update.date}</p>
          <ul className="list-disc pl-5">
            {update.descriptions.map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
