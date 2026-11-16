import { getTranslations } from "next-intl/server";
import { getSession } from "@/auth/server";
import { HydrateClient, orpc, prefetchAsync } from "@/orpc/server";
import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";
import { ContactForm } from "./_features/contact-form";
import { ContactHistory } from "./_features/contact-history";

export default async function Page() {
  const t = await getTranslations("contactPage");
  const session = await getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <H1>{t("title")}</H1>
        <CardWithContent>
          <P>{t("loginRequired")}</P>
        </CardWithContent>
      </div>
    );
  }

  await prefetchAsync(orpc.contact.listMine.queryOptions());

  return (
    <HydrateClient>
      <div className="mx-auto max-w-3xl space-y-6">
        <H1>{t("title")}</H1>
        <CardWithContent className={{ cardContent: "space-y-4" }}>
          <P className="text-muted-foreground text-sm">{t("note")}</P>
          <ContactForm />
        </CardWithContent>
        <H2>{t("history")}</H2>
        <ContactHistory />
      </div>
    </HydrateClient>
  );
}
