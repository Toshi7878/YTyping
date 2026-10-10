import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { H1 } from "@/ui/typography";
import { ContactList } from "./_features/contact-list";

export default async function Page() {
  await prefetchAsync(orpc.contact.adminList.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <H1>お問い合わせ管理</H1>
        <ContactList />
      </div>
    </HydrateClient>
  );
}
