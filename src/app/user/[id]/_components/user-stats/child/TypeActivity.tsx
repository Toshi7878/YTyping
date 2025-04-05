"use client";

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Flex, Spinner, Text, useTheme } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import ActivityCalendar from "react-activity-calendar";

const TypeActivity = () => {
  const { id: userId } = useParams() as { id: string };
  const { data, isPending, isError } = clientApi.userStats.getUserActivity.useQuery({
    userId: parseInt(userId),
  });
  const { colors }: ThemeColors = useTheme();

  const getThemeColors = () => {
    const roma = [
      `${colors.semantic.roma}40`,
      `${colors.semantic.roma}60`,
      `${colors.semantic.roma}80`,
      colors.semantic.roma,
    ];
    const kana = [
      `${colors.semantic.kana}40`,
      `${colors.semantic.kana}60`,
      `${colors.semantic.kana}80`,
      colors.semantic.kana,
    ];
    const english = [
      `${colors.semantic.english}40`,
      `${colors.semantic.english}60`,
      `${colors.semantic.english}80`,
      colors.semantic.english,
    ];

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
            maxLevel={12}
            renderBlock={(block, activity) => (
              <CustomToolTip placement="top" label={`${activity.count} 打鍵 ${activity.date}`}>
                {block}
              </CustomToolTip>
            )}
            weekStart={1}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default TypeActivity;
