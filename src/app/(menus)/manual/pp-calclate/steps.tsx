import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Separator } from "@/ui/separator";
import { H3, OList, P } from "@/ui/typography";

function FormulaBlock({ children }: { children: ReactNode }) {
  return (
    <div className="my-2 whitespace-pre-wrap rounded-md bg-accent px-4 py-2 font-mono text-sm leading-relaxed">
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; content: ReactNode; links?: string[] }[] }) {
  const t = useTranslations("manualPp");

  return (
    <OList
      className="list-inside list-decimal space-y-6"
      listClassName="marker:text-lg marker:font-semibold"
      items={steps.map((step, i) => (
        <>
          <H3 className="inline">{step.title}</H3>
          {step.links?.map((link, j) => (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
              key={j}
              href={link as Route}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 align-middle text-muted-foreground text-xs hover:text-primary"
            >
              <ExternalLink size={12} />
              {t("code")}
            </Link>
          ))}
          {step.content}
          {i !== steps.length - 1 && <Separator className="my-4" />}
        </>
      ))}
    />
  );
}

export function DifficultySteps() {
  const t = useTranslations("manualPp.rating");
  const RATING_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/shared/map/rating/calc.ts";
  const steps = [
    { key: "kpm", links: [`${RATING_URL}#L69`] },
    { key: "diversity", links: [`${RATING_URL}#L26-L40`] },
    { key: "penalty", links: [`${RATING_URL}#L48-L51`] },
    { key: "score", links: [`${RATING_URL}#L84-L96`] },
    { key: "notes", links: [`${RATING_URL}#L58-L60`] },
    { key: "final", links: [`${RATING_URL}#L101`] },
  ] as const;

  return (
    <StepList
      steps={steps.map(({ key, links }) => ({
        title: t(`${key}.title`),
        links: [...links],
        content: (
          <>
            <P>{t(`${key}.body`)}</P>
            <FormulaBlock>{t(`${key}.formula`)}</FormulaBlock>
          </>
        ),
      }))}
    />
  );
}

export function PPSteps() {
  const t = useTranslations("manualPp.pp");
  const PP_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/shared/result/pp/calc.ts";
  const HELPER_URL = "https://github.com/Toshi7878/YTyping/blob/main/src/shared/result/pp/helper.ts";
  const MISS_URL =
    "https://github.com/Toshi7878/YTyping/blob/main/src/app/(typing)/type/_feature/typing-card/playing/update-status/miss.ts";
  const SAVE_LINE_URL =
    "https://github.com/Toshi7878/YTyping/blob/main/src/app/(typing)/type/_feature/typing-card/playing/save-line-result.ts";
  const steps = [
    {
      title: t("base.title"),
      links: [`${PP_URL}#L13-L15`],
      content: (
        <>
          <P>{t("base.body")}</P>
          <FormulaBlock>{t("base.formula")}</FormulaBlock>
        </>
      ),
    },
    {
      title: t("clearRate.title"),
      links: [`${HELPER_URL}#L111-L116`, `${MISS_URL}#L19-L24`, `${SAVE_LINE_URL}#L41-L44`, `${PP_URL}#L36-L40`],
      content: (
        <>
          <P>
            {t("clearRate.body1")}
            <br />
            {t("clearRate.legend1")}
          </P>
          <FormulaBlock>{t("clearRate.formula1")}</FormulaBlock>
          <P>
            {t("clearRate.body2")}
            <br />
            {t("clearRate.legend2")}
          </P>
          <FormulaBlock>{t("clearRate.formula2")}</FormulaBlock>
        </>
      ),
    },
    {
      title: t("accuracy.title"),
      links: [`${PP_URL}#L56-L85`],
      content: (
        <>
          <P>
            {t("accuracy.body")}
            <br />
            {t("accuracy.legend")}
          </P>
          <FormulaBlock>{t("accuracy.formula")}</FormulaBlock>
        </>
      ),
    },
    {
      title: t("speed.title"),
      links: [`${PP_URL}#L22-L25`],
      content: (
        <>
          <P>{t("speed.body")}</P>
          <FormulaBlock>{t("speed.formula")}</FormulaBlock>
        </>
      ),
    },
    {
      title: t("raw.title"),
      links: [`${PP_URL}#L87-L95`],
      content: (
        <>
          <P>{t("raw.body")}</P>
          <FormulaBlock>{t("raw.formula")}</FormulaBlock>
        </>
      ),
    },
    {
      title: t("total.title"),
      links: [`${PP_URL}#L100-L108`],
      content: (
        <>
          <P>{t("total.body")}</P>
          <FormulaBlock>{t("total.formula")}</FormulaBlock>
        </>
      ),
    },
  ];

  return <StepList steps={steps} />;
}
