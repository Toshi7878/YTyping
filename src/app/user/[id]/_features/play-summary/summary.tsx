"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { GoLock } from "react-icons/go";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { Badge } from "@/ui/badge";
import { buttonVariants } from "@/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { H2 } from "@/ui/typography";
import { cn } from "@/utils/cn";
import { ActivityYearButtons, TypeActivity } from "./type-activity";

const splitDuration = (totalSeconds: number) => ({
  hours: Math.floor(totalSeconds / 3600),
  minutes: Math.floor((totalSeconds % 3600) / 60),
  seconds: Number((totalSeconds % 60).toFixed()),
});

export const UserPlaySummary = ({ id }: { id: string }) => {
  const t = useTranslations("user.summary");
  const { data: userStats } = useSuspenseQuery(orpc.user.stats.get.queryOptions({ input: { userId: Number(id) } }));

  const { data: session } = useSession();
  const userSearchParams = useSearchParams();
  const isHidePreview = userSearchParams.get("hidePreview") === "true";
  const isHideUserStats = userStats?.options?.hideUserStats ?? false;
  const isMyStats = session?.user?.id === Number(id);
  const isMyStatsWithHide = isMyStats && isHideUserStats;

  return (
    <Card>
      <CardHeader className="mx-8 flex flex-col items-center">
        <Badge variant="secondary" className="text-xs">
          {t("updateNote")}
        </Badge>
      </CardHeader>
      <CardContent className="mx-8">
        {(isHideUserStats && !isMyStats) || isHidePreview ? (
          <HideSummary isMyStatsWithHide={isMyStatsWithHide} />
        ) : (
          <SummaryContent userStats={userStats} isMyStatsWithHide={isMyStatsWithHide} />
        )}
      </CardContent>
      <CardFooter className="mx-8" />
    </Card>
  );
};

interface SummaryContentProps {
  userStats: RouterOutputs["user"]["stats"]["get"];
  isMyStatsWithHide: boolean;
}

const SummaryContent = ({ userStats, isMyStatsWithHide }: SummaryContentProps) => {
  const t = useTranslations("user.summary");
  const locale = useLocale();
  if (!userStats) {
    return <div>{t("noData")}</div>;
  }
  const { typeCounts } = userStats;

  const totalKeystrokes = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0);

  const keystrokeStatsData = [
    { label: t("romaTypes"), value: typeCounts.romaTypeTotalCount },
    { label: t("kanaTypes"), value: typeCounts.kanaTypeTotalCount },
    { label: t("englishTypes"), value: typeCounts.englishTypeTotalCount },
    { label: t("spaceTypes"), value: typeCounts.spaceTypeTotalCount },
    { label: t("numTypes"), value: typeCounts.numTypeTotalCount },
    { label: t("symbolTypes"), value: typeCounts.symbolTypeTotalCount },
    { label: t("flickTypes"), value: typeCounts.flickTypeTotalCount },
    { label: t("imeTypes"), value: typeCounts.imeTypeTotalCount },
    { label: t("totalTypes"), value: totalKeystrokes },
  ];

  const generalStatsData = [
    {
      label: t("startedAt"),
      value: (
        <div className="flex items-center gap-2">
          <span>{userStats.createdAt.toLocaleDateString()}</span>
          <span className="text-muted-foreground text-sm">
            ({formatDistanceToNowStrict(userStats.createdAt, { addSuffix: true, locale: locale === "en" ? enUS : ja })})
          </span>
        </div>
      ),
    },
    { label: t("typingTime"), value: t("duration", splitDuration(userStats.totalTypingTime)) },
    { label: t("playCount"), value: userStats.totalPlayCount },
    { label: t("maxCombo"), value: userStats.maxCombo },
  ];

  return (
    <div className="flex flex-col gap-4">
      {isMyStatsWithHide && <MyHideOptionInfo />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {generalStatsData.map((item) => (
          <SummaryCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <H2>{t("keystrokeInfo")}</H2>

      <div className="relative flex min-h-[200px] w-full justify-center gap-4">
        <TypeActivity />
        <ActivityYearButtons />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keystrokeStatsData.map((item) => (
          <SummaryCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string | number | ReactNode }) => {
  return (
    <Card className="gap-1 rounded-sm border border-accent-foreground/50 bg-background py-4 pl-8">
      <CardTitle className="font-normal text-lg">{label}</CardTitle>
      <div className="font-bold text-2xl">{value}</div>
    </Card>
  );
};

const HideSummary = ({ isMyStatsWithHide }: { isMyStatsWithHide: boolean }) => {
  const t = useTranslations("user.summary");
  return (
    <div>
      {isMyStatsWithHide && <MyHideOptionInfo />}
      <div className="flex flex-col items-center justify-center gap-4">
        <GoLock size={30} />
        <p>{t("hidden")}</p>
      </div>
    </div>
  );
};

const MyHideOptionInfo = () => {
  const t = useTranslations("user.summary");
  const userSearchParams = useSearchParams();
  const isHidePreview = userSearchParams.get("hidePreview") === "true";
  const { id: userId } = useParams<{ id: string }>();

  return (
    <InfoCard title={t("hiddenNoticeTitle")} className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p>{t("onlyYouCanView")}</p>
          {!isHidePreview ? (
            <Link href="?hidePreview=true" className={buttonVariants({ size: "sm", variant: "outline" })}>
              {t("viewAsOthers")}
            </Link>
          ) : (
            <Link href={`/user/${userId}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
              {t("showStats")}
            </Link>
          )}
        </div>
        <div className="flex justify-end">
          <Link href="/user/settings#user-settings" className={buttonVariants({ size: "sm", variant: "outline" })}>
            {t("changeSettings")}
          </Link>
        </div>
      </div>
    </InfoCard>
  );
};

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const InfoCard = ({ title, children, className }: InfoCardProps) => {
  return (
    <Card className={cn("border-primary bg-primary/50", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <IoMdInformationCircleOutline size={20} className="text-primary-foreground" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
};
