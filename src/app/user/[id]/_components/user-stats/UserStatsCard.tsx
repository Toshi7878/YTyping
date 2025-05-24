import CustomCard from "@/components/custom-ui/CustomCard";
import CustomSimpleGrid from "@/components/custom-ui/CustomSimpleGrid";
import InfoCard from "@/components/share-components/InfoCard";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import {
  Badge,
  Box,
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { GoLock } from "react-icons/go";
import TypeActivity from "./child/TypeActivity";

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}時間 ${minutes}分 ${seconds.toFixed()}秒`;
};

interface UserStatsProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"];
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const UserStatsCard = ({ userStats, userOptions }: UserStatsProps) => {
  const { id: userId } = useParams() as { id: string };
  const { data: session } = useSession();
  const userSearchParams = useSearchParams();
  const isHidePreview = userSearchParams.get("hidePreview") === "true";
  const isHideUserStats = userOptions?.hide_user_stats ?? false;
  const isMyStats = session?.user?.id === userId;
  const isMyStatsWithHide = isMyStats && isHideUserStats;

  return (
    <CustomCard>
      <CardHeader mx={8} textAlign="center">
        <Heading as="h3" size="lg" mb={2}>
          タイピング統計情報
        </Heading>
        <Badge colorScheme="blue" fontSize="md">
          統計情報はやり直し時・ページ離脱時・リザルト時に更新されます
        </Badge>
      </CardHeader>
      <CardBody mx={8}>
        {(isHideUserStats && !isMyStats) || isHidePreview ? (
          <HideUserStats isMyStatsWithHide={isMyStatsWithHide} />
        ) : (
          <UserStatsContent userStats={userStats} isMyStatsWithHide={isMyStatsWithHide} />
        )}
      </CardBody>
      <CardFooter mx={8} />
    </CustomCard>
  );
};

interface UserStatsContentProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"];
  isMyStatsWithHide: boolean;
}

const UserStatsContent = ({ userStats, isMyStatsWithHide }: UserStatsContentProps) => {
  const theme: ThemeColors = useTheme();
  if (!userStats) {
    return null;
  }

  const totalKeystrokes =
    userStats.roma_type_total_count +
    userStats.kana_type_total_count +
    userStats.flick_type_total_count +
    userStats.english_type_total_count +
    userStats.space_type_total_count +
    userStats.num_type_total_count +
    userStats.symbol_type_total_count +
    userStats.ime_type_total_count;

  const keystrokeStatsData = [
    { label: "ローマ字 打鍵数", value: userStats.roma_type_total_count },
    { label: "かな入力 打鍵数", value: userStats.kana_type_total_count },
    { label: "英語 打鍵数", value: userStats.english_type_total_count },
    { label: "スペース 打鍵数", value: userStats.space_type_total_count },
    { label: "数字 打鍵数", value: userStats.num_type_total_count },
    { label: "記号 打鍵数", value: userStats.symbol_type_total_count },
    { label: "フリック 打鍵数", value: userStats.flick_type_total_count },
    { label: "変換有り 打鍵数", value: userStats.ime_type_total_count },
    { label: "合計 打鍵数", value: totalKeystrokes },
  ];

  const generalStatsData = [
    {
      label: "計測開始日",
      value: (
        <Flex as="time" alignItems="center" gap={2}>
          <Text as="span">{userStats.created_at.toLocaleDateString()}</Text>
          <Text as="span" fontSize="sm" color="gray.500">
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
    <>
      {isMyStatsWithHide && <MyHideOptionInfo />}

      <CustomSimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        {generalStatsData.map((item, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg={theme.colors.background.body}>
            <Flex direction="column">
              <Text fontSize="lg" mb={1}>
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {item.value}
              </Text>
            </Flex>
          </Box>
        ))}
      </CustomSimpleGrid>
      <Divider my={4} />
      <Heading as="h4" size="md" mb={4}>
        打鍵情報
      </Heading>
      <TypeActivity />

      <CustomSimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {keystrokeStatsData.map((item, index) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg={theme.colors.background.body}>
            <Flex direction="column">
              <Text fontSize="lg" mb={1}>
                {item.label}
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {item.value}
              </Text>
            </Flex>
          </Box>
        ))}
      </CustomSimpleGrid>
    </>
  );
};

const HideUserStats = ({ isMyStatsWithHide }: { isMyStatsWithHide: boolean }) => {
  return (
    <Box>
      {isMyStatsWithHide && <MyHideOptionInfo />}
      <Flex justifyContent="center" flexDirection="column" alignItems="center" gap={4}>
        <GoLock size={30} />
        <Text>タイピング統計情報は非公開にしています</Text>
      </Flex>
    </Box>
  );
};

const MyHideOptionInfo = () => {
  const userSearchParams = useSearchParams();
  const isHidePreview = userSearchParams.get("hidePreview") === "true";
  const { id: userId } = useParams() as { id: string };
  const handleLinkClick = useLinkClick();

  return (
    <InfoCard title="統計情報は非公開に設定されています" mb={4}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={4}>
          <Text>現在プロフィールは自分のみが閲覧できます</Text>
          {!isHidePreview ? (
            <Link href="?hidePreview=true" onClick={handleLinkClick}>
              <Button size="sm">他の人が見ているページを見る</Button>
            </Link>
          ) : (
            <Link href={`/user/${userId}`} onClick={handleLinkClick}>
              <Button size="sm">統計情報を表示</Button>
            </Link>
          )}
        </Flex>
        <Flex justifyContent="flex-end">
          <Link href="/user/settings#user-settings" onClick={handleLinkClick}>
            <Button size="xs">設定を変更</Button>
          </Link>
        </Flex>
      </Flex>
    </InfoCard>
  );
};

export default UserStatsCard;
