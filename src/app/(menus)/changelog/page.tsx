import { getLocale, getTranslations } from "next-intl/server";
import { caller } from "@/orpc/server";
import { CardWithContent } from "@/ui/card";
import { H1, Large, Small, UList } from "@/ui/typography";
import { formatDate } from "@/utils/date";
import { changelog } from "./changelog";

export default async function Page() {
  const t = await getTranslations("changelogPage");
  const locale = await getLocale();
  const buildingDate = await caller.vercel.getActiveBuildingAt();

  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1 className="flex items-baseline gap-4">
        {t("title")}{" "}
        {buildingDate && (
          <Small>{t("updated", { date: formatDate(buildingDate, locale === "en" ? "en-US" : "ja-JP") })}</Small>
        )}
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
