"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Box, Divider, Flex, Spinner, Text, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import ActivityCalendar, { Activity } from "react-activity-calendar";

const TypeActivity = () => {
  const { id: userId } = useParams() as { id: string };
  const { data, isPending, isError } = clientApi.userStats.getUserActivity.useQuery({
    userId: parseInt(userId),
  });
  const { colors }: ThemeColors = useTheme();

  const getThemeColors = () => {
    const roma = [`${colors.semantic.roma}40`, `${colors.semantic.roma}80`, colors.semantic.roma];
    const kana = [`${colors.semantic.kana}40`, `${colors.semantic.kana}80`, colors.semantic.kana];
    const english = [`${colors.semantic.english}40`, `${colors.semantic.english}80`, colors.semantic.english];

    return ["#161b22"].concat(roma).concat(kana).concat(english);
  };

  return (
    <Flex justifyContent="center" minHeight="200px" width="100%" position="relative">
      {isPending ? (
        <Flex justifyContent="center" alignItems="center" width="100%" height="200px">
          <Spinner />
        </Flex>
      ) : isError ? (
        <Flex justifyContent="center" alignItems="center" width="100%" height="200px">
          <Text>エラーが発生しました</Text>
        </Flex>
      ) : (
        <Flex justifyContent="center" width="100%">
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
            maxLevel={9}
            renderBlock={(block, activity) => {
              return (
                <CustomToolTip placement="top" label={<BlockToolTipLabel activity={activity} />}>
                  {block}
                </CustomToolTip>
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
                  : `英数字記号 level: ${levelLabel}`;

              return (
                <CustomToolTip placement="top" label={label}>
                  <Box mr={levelLabel === 3 ? "10px" : "0px"}>{color}</Box>
                </CustomToolTip>
              );
            }}
            weekStart={1}
          />
        </Flex>
      )}
    </Flex>
  );
};

const BlockToolTipLabel = ({ activity }: { activity: Activity }) => {
  const { data } = activity as RouterOutPuts["userStats"]["getUserActivity"][number];
  const sortedTypeData = [
    { label: "ローマ字", count: data?.roma_type_count ?? 0 },
    { label: "かな", count: data?.kana_type_count ?? 0 },
    { label: "英数字記号", count: data?.english_type_count ?? 0 },
  ].sort((a, b) => b.count - a.count);

  const sortedTypeDataString = sortedTypeData.map((item) => {
    return (
      <Box key={item.label} fontSize="xs">
        {item.label}: {item.count}
      </Box>
    );
  });

  return (
    <Flex flexDirection="column" gap={2}>
      {sortedTypeDataString}
      <Divider />
      <Box>合計打鍵数: {activity.count}</Box>
      <Box>日付: {activity.date}</Box>
    </Flex>
  );
};

export default TypeActivity;
