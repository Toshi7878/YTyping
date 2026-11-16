import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { PPRanking } from "./_feature/pp-ranking";
import { PPRankingInfoTrigger } from "./_feature/pp-ranking-info-trigger";
import { loadPpRankingSearchParams } from "./_feature/search-params";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("rankings.performance");
  return { title: t("metaTitle"), description: t("metaDescription") };
};

export default async function Page({ searchParams }: PageProps<"/">) {
  const t = await getTranslations("rankings.performance");
  const { page, mode } = await loadPpRankingSearchParams(searchParams);
  await prefetchAsync(orpc.ranking.pp.list.get.queryOptions({ input: { cursor: page - 1, mode } }));
  await prefetchAsync(orpc.ranking.pp.list.getPageCount.queryOptions({ input: { mode } }));

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-3 px-4 lg:px-8">
        <H1 className="flex flex-wrap items-center gap-x-2">
          <span>{t("title")}</span>
          <div>
            <PPRankingInfoTrigger />
            <Link href="/manual/pp-calclate" className="ml-2 text-primary-light text-xs hover:underline">
              {t("calcLink")}
            </Link>
          </div>
        </H1>

        <PPRanking />
      </div>
    </HydrateClient>
  );
}
