"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { cloneElement } from "react";
import { type Activity, ActivityCalendar } from "react-activity-calendar";
import { Separator } from "@/components/ui/separator";
import { TooltipWrapper } from "@/components/ui/tooltip";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { getCSSVariable } from "@/utils/get-computed-color";

export const TypeActivity = () => {
  const trpc = useTRPC();
  const { id: userId } = useParams<{ id: string }>();
  const { data, isPending, isError } = useQuery(
    trpc.userStats.getUserActivity.queryOptions({ userId: Number(userId) }, { staleTime: Infinity, gcTime: Infinity }),
  );

  const blockColors = getBlockColors();

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
            data={data ?? []} // dataがundefinedの場合は空配列を渡す
            labels={{
              months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
              weekdays: ["日", "月", "火", "水", "木", "金", "土"],
              totalCount: "{{count}} 打鍵",
            }}
            theme={{ dark: blockColors }}
            colorScheme="dark"
            blockSize={14}
            blockMargin={3}
            maxLevel={12}
            renderBlock={(block, activity) => {
              const styledBlock = cloneElement(block, {
                style: {
                  ...block.props.style,
                  opacity: getOpacity(activity.level),
                },
              });

              return (
                <TooltipWrapper key={activity.date} label={<BlockToolTipLabel activity={activity} />}>
                  {styledBlock}
                </TooltipWrapper>
              );
            }}
            renderColorLegend={(_block, level) => {
              const color = blockColors[level] ?? "";
              const label = getLevelLabel(level);

              return (
                <TooltipWrapper key={level} label={label}>
                  <div className={level % 3 === 0 ? "mr-2" : ""} style={{ opacity: getOpacity(level) }}>
                    <div style={{ width: 14, height: 14, backgroundColor: color, borderRadius: 2 }} />
                  </div>
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

const getBlockColors = () => {
  const colors = {
    background: getCSSVariable("--background"),
    roma: getCSSVariable("--roma"),
    kana: getCSSVariable("--kana"),
    flick: getCSSVariable("--flick"),
    english: getCSSVariable("--english"),
    ime: getCSSVariable("--foreground"),
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
  const { data } = activity as RouterOutputs["userStats"]["getUserActivity"][number];
  const sortedTypeData = [
    { label: "ローマ字", count: data?.romaTypeCount ?? 0 },
    { label: "かな", count: data?.kanaTypeCount ?? 0 },
    { label: "英数字記号", count: data?.englishTypeCount ?? 0 },
    { label: "変換有りタイプ数", count: data?.imeTypeCount ?? 0 },
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

// コンポーネント定義の外に配置
const getLevelLabel = (level: number) => {
  const levelLabel = level % 3 === 0 ? 3 : level % 3;

  if (level === 0) return "活動なし";
  if (level <= 3) return `ローマ字 level: ${levelLabel}`;
  if (level <= 6) return `かな level: ${levelLabel}`;
  if (level <= 9) return `英数字記号 level: ${levelLabel}`;
  return `変換有りタイプ数 level: ${levelLabel}`;
};
