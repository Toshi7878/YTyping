import CustomCard from "@/components/custom-ui/CustomCard";
import CustomSimpleGrid from "@/components/custom-ui/CustomSimpleGrid";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { Badge, Box, CardBody, CardFooter, CardHeader, Divider, Flex, Heading, Text, useTheme } from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}時間 ${minutes}分 ${seconds.toFixed()}秒`;
};

interface UserStatsCardProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"];
}

const UserStatsCard = ({ userStats }: UserStatsCardProps) => {
  const theme: ThemeColors = useTheme();
  if (!userStats) {
    return null;
  }

  // 各打鍵数の合計を計算
  const totalKeystrokes =
    userStats.roma_type_total_count +
    userStats.kana_type_total_count +
    userStats.flick_type_total_count +
    userStats.english_type_total_count +
    userStats.space_type_total_count +
    userStats.num_type_total_count +
    userStats.symbol_type_total_count;

  // 打鍵数に関する統計情報
  const keystrokeStatsData = [
    { label: "ローマ字 打鍵数", value: userStats.roma_type_total_count },
    { label: "かな入力 打鍵数", value: userStats.kana_type_total_count },
    { label: "英語 打鍵数", value: userStats.english_type_total_count },
    { label: "スペース 打鍵数", value: userStats.space_type_total_count },
    { label: "数字 打鍵数", value: userStats.num_type_total_count },
    { label: "記号 打鍵数", value: userStats.symbol_type_total_count },
    { label: "フリック 打鍵数", value: userStats.flick_type_total_count },
    { label: "合計 打鍵数", value: totalKeystrokes },
  ];

  const generalStatsData = [
    {
      label: "計測開始日",
      value: (
        <Flex as="time" alignItems="center" gap={2}>
          <Text>{userStats.created_at.toLocaleDateString()}</Text>
          <Text fontSize="sm" color="gray.500">
            ({formatDistanceToNowStrict(userStats.created_at, { addSuffix: true, locale: ja })})
          </Text>
        </Flex>
      ),
    },
    { label: "タイピング時間", value: formatTime(userStats.total_typing_time) },
    { label: "プレイ回数", value: userStats.total_play_count },
    { label: "最大コンボ", value: userStats.max_combo },
  ];

  return (
    <CustomCard>
      <CardHeader mx={8} textAlign="center">
        <Heading as="h3" size="lg" mb={2}>
          ユーザー累計情報
        </Heading>
        <Badge colorScheme="blue" fontSize="md">
          記録はやり直し時・ページ離脱時・リザルト時に更新されます
        </Badge>
      </CardHeader>
      <CardBody mx={8}>
        <Heading as="h4" size="md" mb={4}>
          基本情報
        </Heading>
        <CustomSimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
          {generalStatsData.map((item, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg={theme.colors.background.body}>
              <Text fontSize="lg" mb={1}>
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {item.value}
              </Text>
            </Box>
          ))}
        </CustomSimpleGrid>
        <Divider my={4} />
        <Heading as="h4" size="md" mb={4}>
          打鍵情報
        </Heading>
        <CustomSimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {keystrokeStatsData.map((item, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg={theme.colors.background.body}>
              <Text fontSize="lg" mb={1}>
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {item.value}
              </Text>
            </Box>
          ))}
        </CustomSimpleGrid>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default UserStatsCard;
