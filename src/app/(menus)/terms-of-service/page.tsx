import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("terms");
  return { title: t("metaTitle"), description: t("metaDescription") };
};

export default async function TermsOfServicePage() {
  const t = await getTranslations("terms");
  const tLegal = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <H1>{t("title")}</H1>
      {tLegal("translationNotice") && <P className="text-muted-foreground text-sm">{tLegal("translationNotice")}</P>}

      <CardWithContent>
        <H2>{t("introTitle")}</H2>
        <P>{t("intro")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("prohibitedTitle")}</H2>
        <P>{t("prohibitedIntro")}</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          {(t.raw("prohibited") as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("suspensionTitle")}</H2>
        <P>{t("suspension")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("recordsTitle")}</H2>
        <P>{t("records")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("disclaimerTitle")}</H2>
        <P>{t("disclaimer")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("contactTitle")}</H2>
        <P>{t("contact")}</P>
      </CardWithContent>
    </div>
  );
}
