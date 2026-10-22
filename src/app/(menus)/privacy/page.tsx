import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CardWithContent } from "@/ui/card";
import { H1, H2, P } from "@/ui/typography";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("privacy");
  return { title: t("metaTitle"), description: t("metaDescription") };
};

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const tLegal = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <H1>{t("title")}</H1>
      {tLegal("translationNotice") && <P className="text-muted-foreground text-sm">{tLegal("translationNotice")}</P>}

      <CardWithContent>
        <H2>{t("collectTitle")}</H2>
        <P>{t("collectIntro")}</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          {(t.raw("collect") as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("authTitle")}</H2>
        <P>{t("authIntro")}</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>Google</li>
          <li>Discord</li>
        </ul>
        <P>{t("auth")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("purposeTitle")}</H2>
        <P>{t("purposeIntro")}</P>
        <ul className="my-4 list-disc space-y-2 pl-6">
          {(t.raw("purpose") as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("thirdPartyTitle")}</H2>
        <P>{t("thirdParty")}</P>
      </CardWithContent>

      <CardWithContent>
        <H2>{t("contactTitle")}</H2>
        <P>{t("contact")}</P>
      </CardWithContent>
    </div>
  );
}
