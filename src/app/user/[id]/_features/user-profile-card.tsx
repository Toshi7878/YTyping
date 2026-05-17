"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MdOutlineEdit } from "react-icons/md";
import { useSession } from "@/auth/client";
import { PAGE_SIZE } from "@/server/api/routers/ranking/pp/const";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { DataList, DataListItem, DataListLabel, DataListValue } from "@/ui/data-list";
import { TooltipWrapper } from "@/ui/tooltip";
import { H2, LinkText } from "@/ui/typography";
import { ReportDialog } from "./report-dialog";
import { WarningDialog } from "./warning-dialog";

interface UserProfileCardProps {
  userProfile: RouterOutputs["user"]["profile"]["get"];
}

export const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const { id: userId } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const trpc = useTRPC();
  const { data: ppRank } = useSuspenseQuery(trpc.ranking.pp.getRankByUserId.queryOptions(Number(userId)));
  const isMyProfilePage = session?.user.id === Number(userId);
  const isAdmin = session?.user.role === "ADMIN";
  const canSeeWarnings = isMyProfilePage || isAdmin;

  const profile = [
    {
      label: "運指表",
      value: userProfile?.fingerChartUrl ? (
        <LinkText href={userProfile.fingerChartUrl as Route}>運指表を見る</LinkText>
      ) : (
        <span className="text-muted-foreground">運指表は未設定です</span>
      ),
    },
    {
      label: "使用キーボード",
      value: userProfile?.keyboard ? (
        <span>{userProfile.keyboard}</span>
      ) : (
        <span className="text-muted-foreground">使用キーボードは未設定です</span>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="relative flex flex-col gap-4 md:mx-8">
        <H2>{userProfile?.name ?? ""}</H2>
        <DataList orientation="horizontal" className="gap-3">
          <DataListItem className="flex items-center gap-2 font-bold text-2xl">
            <DataListLabel>実力ランク:</DataListLabel>
            <DataListValue>
              {ppRank ? (
                <Link href={`/rankings/performance?page=${Math.ceil(ppRank / PAGE_SIZE)}`} className="hover:underline">
                  #{ppRank}
                </Link>
              ) : (
                "-"
              )}
            </DataListValue>
          </DataListItem>
          {profile.map((item) => (
            <DataListItem key={item.label} className="flex items-center gap-2">
              <DataListLabel>{item.label}:</DataListLabel>
              <DataListValue>{item.value}</DataListValue>
            </DataListItem>
          ))}
        </DataList>
        <div className="absolute right-0 bottom-0 flex items-center gap-1">
          {canSeeWarnings && <WarningDialog userId={Number(userId)} warningCount={userProfile?.warningCount ?? 0} />}
          {session &&
            (isMyProfilePage ? (
              <TooltipWrapper label="プロフィール編集ページに移動" asChild>
                <Button variant="outline" size="icon" asChild>
                  <Link href="/user/settings">
                    <MdOutlineEdit className="size-4" />
                    <span className="sr-only">編集</span>
                  </Link>
                </Button>
              </TooltipWrapper>
            ) : (
              <ReportDialog reportedUserId={Number(userId)} userName={userProfile?.name} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
