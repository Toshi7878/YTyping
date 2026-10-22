import { getTranslations } from "next-intl/server";
import { HydrateClient, orpc, prefetch } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { BookmarkListView } from "./_components/bookmark-list";

export default async function Page() {
  const t = await getTranslations("bookmarks");
  prefetch(orpc.map.bookmark.lists.getAll.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-6xl space-y-4 lg:px-8">
        <H1>{t("title")}</H1>
        <BookmarkListView />
      </div>
    </HydrateClient>
  );
}
