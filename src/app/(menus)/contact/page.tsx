import { getSession } from "@/auth/server";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";
import { ContactForm } from "./_features/contact-form";
import { ContactHistory } from "./_features/contact-history";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <H1>お問い合わせ</H1>
        <CardWithContent>
          <P>お問い合わせにはログインが必要です。右上のメニューからログインしてください。</P>
        </CardWithContent>
      </div>
    );
  }

  await prefetchAsync(orpc.contact.listMine.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-6">
        <H1>お問い合わせ</H1>
        <CardWithContent>
          <ContactForm />
        </CardWithContent>
        <H2>お問い合わせ履歴</H2>
        <ContactHistory />
      </div>
    </HydrateClient>
  );
}
