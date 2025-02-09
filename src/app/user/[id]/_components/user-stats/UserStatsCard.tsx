import CustomCard from "@/components/custom-ui/CustomCard";
import { RouterOutPuts } from "@/server/api/trpc";
import {
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";

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
  // フィールド名と表示ラベルのマッピング

  if (!userStats) {
    return;
  }
  const statsData = [
    // { label: "ランキング合計", value: userStats.total_ranking_count },
    { label: "累計 タイピング時間", value: formatTime(userStats.total_typing_time) },
    { label: "累計 プレイ 回数", value: userStats.total_play_count },
    { label: "累計ローマ字 打鍵数", value: userStats.roma_type_total_count },
    { label: "累計かな入力 打鍵数", value: userStats.kana_type_total_count },
    { label: "累計フリック 打鍵数", value: userStats.flick_type_total_count },
    { label: "累計　英語　 打鍵数", value: userStats.english_type_total_count },
    { label: "累計スペース 打鍵数", value: userStats.space_type_total_count },
    { label: "累計　数字　 打鍵数", value: userStats.num_type_total_count },
    { label: "累計　記号　 打鍵数", value: userStats.symbol_type_total_count },
    { label: "最大コンボ", value: userStats.max_combo },
    { label: "計測開始日", value: new Date(userStats.created_at).toLocaleDateString() },
  ];

  return (
    <CustomCard>
      <CardHeader mx={8}>
        <Heading as="h3" size="md">
          ユーザー累計情報
        </Heading>
      </CardHeader>
      <CardBody mx={8}>
        <TableContainer>
          <Table variant="simple" style={{ tableLayout: "fixed" }}>
            <Tbody
              sx={{
                "td.label": {
                  width: "25%",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  fontSize: "lg",
                },
                "td.total-value": {
                  textAlign: "left",
                  fontSize: "2xl",
                  // 必要に応じて他のスタイルも追加できます
                },
              }}
            >
              {statsData.map((item, index) => {
                return (
                  <Tr key={index}>
                    <Td className="label">{item.label}</Td>
                    <Td className="total-value">{item.value}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

export default UserStatsCard;
