"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "@/components/ui/link";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { formatDistanceToNowStrict } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { GoLock } from "react-icons/go";
import { IoMdInformationCircleOutline } from "react-icons/io";
import TypeActivity from "./user-stats/TypeActivity";

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
    <Card>
      <CardHeader className="mx-8 flex flex-col items-center">
        <CardTitle className="mb-2 text-2xl">タイピング統計情報</CardTitle>
        <Badge variant="secondary" className="text-sm">
          統計情報はやり直し時・ページ離脱時・リザルト時に更新されます
        </Badge>
      </CardHeader>
      <CardContent className="mx-8">
        {(isHideUserStats && !isMyStats) || isHidePreview ? (
          <HideUserStats isMyStatsWithHide={isMyStatsWithHide} />
        ) : (
          <UserStatsContent userStats={userStats} isMyStatsWithHide={isMyStatsWithHide} />
        )}
      </CardContent>
      <CardFooter className="mx-8" />
    </Card>
  );
};

interface UserStatsContentProps {
  userStats: RouterOutPuts["userStats"]["getUserStats"];
  isMyStatsWithHide: boolean;
}

const UserStatsContent = ({ userStats, isMyStatsWithHide }: UserStatsContentProps) => {
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
        <div className="flex items-center gap-2">
          <span>{userStats.created_at.toLocaleDateString()}</span>
          <span className="text-muted-foreground text-sm">
            ({formatDistanceToNowStrict(userStats.created_at, { addSuffix: true, locale: ja })})
          </span>
        </div>
      ),
    },
    { label: "タイピング時間", value: formatTime(userStats.total_typing_time) },
    { label: "プレイ回数", value: userStats.total_play_count },
    { label: "最大コンボ", value: userStats.max_combo },
  ];

  return (
    <div className="flex flex-col gap-4">
      {isMyStatsWithHide && <MyHideOptionInfo />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {generalStatsData.map((item, index) => (
          <StatsCard key={index} label={item.label} value={item.value} />
        ))}
      </div>

      <H3>打鍵情報</H3>

      <TypeActivity />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {keystrokeStatsData.map((item, index) => (
          <StatsCard key={index} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
};

const StatsCard = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => {
  return (
    <Card className="bg-background border-accent-foreground/50 gap-1 rounded-sm border py-4 pl-8">
      <CardTitle className="text-lg font-normal">{label}</CardTitle>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
};

const HideUserStats = ({ isMyStatsWithHide }: { isMyStatsWithHide: boolean }) => {
  return (
    <div>
      {isMyStatsWithHide && <MyHideOptionInfo />}
      <div className="flex flex-col items-center justify-center gap-4">
        <GoLock size={30} />
        <p>タイピング統計情報は非公開にしています</p>
      </div>
    </div>
  );
};

const MyHideOptionInfo = () => {
  const userSearchParams = useSearchParams();
  const isHidePreview = userSearchParams.get("hidePreview") === "true";
  const { id: userId } = useParams() as { id: string };
  const handleLinkClick = useLinkClick();

  return (
    <InfoCard title="統計情報は非公開に設定されています" className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p>現在プロフィールは自分のみが閲覧できます</p>
          {!isHidePreview ? (
            <Button size="sm" asChild>
              <Link href="?hidePreview=true" onClick={handleLinkClick}>
                他の人が見ているページを見る
              </Link>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={`/user/${userId}`} onClick={handleLinkClick}>
                統計情報を表示
              </Link>
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link href="/user/settings#user-settings" onClick={handleLinkClick}>
              設定を変更
            </Link>
          </Button>
        </div>
      </div>
    </InfoCard>
  );
};

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard = ({ title, children, className }: InfoCardProps) => {
  return (
    <Card className={cn("border-blue-500 bg-blue-50/50 dark:bg-blue-950/20", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <IoMdInformationCircleOutline size={20} className="text-blue-600 dark:text-blue-400" />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
};

export default UserStatsCard;
