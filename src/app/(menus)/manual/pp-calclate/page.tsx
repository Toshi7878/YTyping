import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader } from "@/ui/card";
import { H1, H2 } from "@/ui/typography";
import { DifficultySteps, PPSteps } from "./steps";

export default async function Page() {
  const t = await getTranslations("manualPp");

  return (
    <article className="mx-auto max-w-7xl space-y-4">
      <H1>{t("title")}</H1>
      <Card>
        <CardHeader>
          <H2>{t("ratingTitle")}</H2>
          <CardDescription>
            {t("ratingDescription")}
            <br />
            {t("caveat")}
            <div className="flex items-center gap-x-2">
              <span>{t("source")}</span>
              <Link
                href="https://github.com/Toshi7878/YTyping/blob/main/src/shared/map/rating/calc.ts"
                className="text-primary-light text-sm hover:underline"
              >
                rating.ts
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DifficultySteps />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <H2>PP (Performance Points)</H2>
          <CardDescription>
            {t("ppDescription")}
            <br />
            {t("caveat")}
            {t("ppCaveat")}
            <div className="flex items-center gap-x-2">
              <span>{t("source")}</span>
              <Link
                href="https://github.com/Toshi7878/YTyping/blob/main/src/shared/result/pp/calc.ts"
                className="text-primary-light text-sm hover:underline"
              >
                pp.ts
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PPSteps />
        </CardContent>
      </Card>
    </article>
  );
}
