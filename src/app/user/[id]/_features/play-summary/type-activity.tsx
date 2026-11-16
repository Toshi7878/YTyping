"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cloneElement, useState } from "react";
import { type Activity, ActivityCalendar } from "react-activity-calendar";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { Skeleton } from "@/ui/skeleton";
import { TooltipWrapper } from "@/ui/tooltip";
import { getTimezone, getYearsDesc } from "@/utils/date";
import { useTargetYearQueryState } from "../search-params";

export const TypeActivity = () => {
  const t = useTranslations("user.activity");
  const { id: userId } = useParams<{ id: string }>();
  const [targetYear] = useTargetYearQueryState();

  const { data: typeActivities, isPending } = useQuery(
    orpc.user.stats.getYearlyTypingActivity.queryOptions({
      input: { userId: Number(userId), targetYear, timezone: getTimezone() },
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  if (isPending) {
    return (
      <div className="relative flex min-h-[200px] w-full justify-center">
        <Skeleton className="h-[200px] w-[846px] bg-card" />
      </div>
    );
  }

  const blockColors = getBlockColors();

  return (
    <ActivityCalendar
      data={typeActivities ?? []}
      labels={{
        months: [...Array(12).keys()].map((i) => t(`months.${i}`)),
        weekdays: [...Array(7).keys()].map((i) => t(`weekdays.${i}`)),
        // react-activity-calendar が埋め込む {{count}} をそのまま使うため、ICU として解釈しない raw を使う
        totalCount: String(t.raw("totalCount")),
      }}
      theme={{ dark: blockColors }}
      colorScheme="dark"
      blockSize={14}
      blockMargin={2}
      maxLevel={12}
      renderBlock={(block, activity) => {
        const styledBlock = cloneElement(block, {
          style: {
            ...block.props.style,
            opacity: getOpacity(activity.level),
          },
        });

        return (
          <TooltipWrapper
            key={activity.date}
            label={<BlockToolTipLabel activity={activity} />}
            delayDuration={0}
            asChild
          >
            {styledBlock}
          </TooltipWrapper>
        );
      }}
      renderColorLegend={(_block, level) => {
        const color = blockColors[level] ?? "";
        const label = getLevelLabel(level, t);

        return (
          <TooltipWrapper key={level} delayDuration={0} label={label} asChild>
            <div className={level % 3 === 0 ? "mr-2" : ""} style={{ opacity: getOpacity(level) }}>
              <div style={{ width: 14, height: 14, backgroundColor: color, borderRadius: 2 }} />
            </div>
          </TooltipWrapper>
        );
      }}
      weekStart={1}
    />
  );
};

export const ActivityYearButtons = () => {
  const [targetYear, setTargetYear] = useTargetYearQueryState();
  const [currentYear] = useState(() => new Date().getFullYear());
  const { id: userId } = useParams<{ id: string }>();
  const { data: oldestYear } = useQuery(
    orpc.user.stats.getActivityOldestYear.queryOptions({
      input: { userId: Number(userId) },
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  const years = getYearsDesc({ oldestYear, currentYear });

  return (
    <div className="flex w-14 shrink-0 flex-col gap-2">
      {years.map((year) => {
        const isActive = year === (targetYear ?? currentYear);
        return (
          <Button
            key={year}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="xs"
            className="w-14 rounded-sm"
            onClick={() => {
              if (year === currentYear) {
                setTargetYear(null);
              } else {
                setTargetYear(year);
              }
            }}
          >
            {year}
          </Button>
        );
      })}
    </div>
  );
};

const getBlockColors = () => {
  const colors = {
    background: "var(--background)",
    roma: "var(--roma)",
    kana: "var(--kana)",
    flick: "var(--flick)",
    english: "var(--english)",
    ime: "var(--foreground)",
  };

  // 透明度なしで色を3段階で返す（同じ色を3回）
  const roma = [colors.roma, colors.roma, colors.roma];
  const kana = [colors.kana, colors.kana, colors.kana];
  const english = [colors.english, colors.english, colors.english];
  const ime = [colors.ime, colors.ime, colors.ime];

  return [colors.background, ...roma, ...kana, ...english, ...ime];
};

const getOpacity = (level: number) => {
  if (level === 0) return 1; // 活動なし
  const modLevel = level % 3;
  if (modLevel === 1) return 0.25; // レベル1
  if (modLevel === 2) return 0.63; // レベル2
  return 1; // レベル3
};

const BlockToolTipLabel = ({ activity }: { activity: Activity }) => {
  const t = useTranslations("user.activity");
  const { data } = activity as RouterOutputs["user"]["stats"]["getYearlyTypingActivity"][number];
  const sortedTypeData = [
    { label: t("roma"), count: data?.romaTypeCount ?? 0 },
    { label: t("kana"), count: data?.kanaTypeCount ?? 0 },
    { label: t("other"), count: (data?.englishTypeCount ?? 0) + (data?.otherTypeCount ?? 0) },
    { label: t("ime"), count: data?.imeTypeCount ?? 0 },
  ].sort((a, b) => b.count - a.count);

  const sortedTypeDataString = sortedTypeData.map((item) => {
    return (
      <div key={item.label} className="text-xs">
        {item.label}: {item.count}
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-2">
      {sortedTypeDataString}
      <Separator />
      <div>{t("total", { count: activity.count })}</div>
      <div>{t("date", { date: activity.date })}</div>
    </div>
  );
};

// コンポーネント定義の外に配置
const getLevelLabel = (level: number, t: ReturnType<typeof useTranslations<"user.activity">>) => {
  const levelLabel = level % 3 === 0 ? 3 : level % 3;

  if (level === 0) return t("none");
  if (level <= 3) return t("level", { label: t("roma"), level: levelLabel });
  if (level <= 6) return t("level", { label: t("kana"), level: levelLabel });
  if (level <= 9) return t("level", { label: t("other"), level: levelLabel });
  return t("level", { label: t("ime"), level: levelLabel });
};
