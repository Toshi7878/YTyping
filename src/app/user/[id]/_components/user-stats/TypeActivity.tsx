"use client";

import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { RouterOutPuts } from "@/server/api/trpc";
import { useUserStatsQueries } from "@/utils/queries/userStats.queries";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import ActivityCalendar, { Activity } from "react-activity-calendar";

const TypeActivity = () => {
  const { id: userId } = useParams() as { id: string };
  const { data, isPending, isError } = useQuery(useUserStatsQueries().userActivity({ userId: Number(userId) }));

  // TODO:chakra ui 移行後 色指定を移行
  const themeColors = {
    roma: "#00b5d8",
    kana: "#de781f",
    flick: "#59e04d",
    english: "#f472b6",
    ime: "#FFFFFF",
  };
  const getThemeColors = () => {
    const roma = [`${themeColors.roma}40`, `${themeColors.roma}a0`, themeColors.roma];
    const kana = [`${themeColors.kana}40`, `${themeColors.kana}a0`, themeColors.kana];
    const english = [`${themeColors.english}40`, `${themeColors.english}a0`, themeColors.english];
    const ime = [`${themeColors.ime}40`, `${themeColors.ime}a0`, themeColors.ime];

    return ["#161b22"].concat(roma).concat(kana).concat(english).concat(ime);
  };

  return (
    <div className="relative flex min-h-[200px] w-full justify-center">
      {isPending ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <p>エラーが発生しました</p>
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <ActivityCalendar
            data={data}
            labels={{
              months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
              weekdays: ["日", "月", "火", "水", "木", "金", "土"],
              totalCount: "{{count}} 打鍵",
            }}
            theme={{
              dark: getThemeColors(),
            }}
            colorScheme="dark"
            blockSize={14}
            blockMargin={3}
            maxLevel={12}
            renderBlock={(block, activity) => {
              return (
                <TooltipWrapper key={activity.date} label={<BlockToolTipLabel activity={activity} />}>
                  {block}
                </TooltipWrapper>
              );
            }}
            renderColorLegend={(color, level) => {
              const levelLabel = level % 3 === 0 ? 3 : level % 3;
              const label =
                level === 0
                  ? "活動なし"
                  : level <= 3
                    ? `ローマ字 level: ${levelLabel}`
                    : level <= 6
                      ? `かな level: ${levelLabel}`
                      : level <= 9
                        ? `英数字記号 level: ${levelLabel}`
                        : `変換有りタイプ数 level: ${levelLabel}`;

              return (
                <TooltipWrapper key={level} label={label}>
                  <div className={levelLabel === 3 ? "mr-2" : ""}>{color}</div>
                </TooltipWrapper>
              );
            }}
            weekStart={1}
          />
        </div>
      )}
    </div>
  );
};

const BlockToolTipLabel = ({ activity }: { activity: Activity }) => {
  const { data } = activity as RouterOutPuts["userStats"]["getUserActivity"][number];
  const sortedTypeData = [
    { label: "ローマ字", count: data?.roma_type_count ?? 0 },
    { label: "かな", count: data?.kana_type_count ?? 0 },
    { label: "英数字記号", count: data?.english_type_count ?? 0 },
    { label: "変換有りタイプ数", count: data?.ime_type_count ?? 0 },
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
      <div>合計打鍵数: {activity.count}</div>
      <div>日付: {activity.date}</div>
    </div>
  );
};

export default TypeActivity;
