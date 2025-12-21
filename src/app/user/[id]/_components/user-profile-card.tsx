"use client";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdOutlineEdit } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataList, DataListItem, DataListLabel, DataListValue } from "@/components/ui/data-list";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { H2, LinkText } from "@/components/ui/typography";
import type { RouterOutputs } from "@/server/api/trpc";

interface UserProfileCardProps {
  userProfile: RouterOutputs["userProfile"]["getUserProfile"];
}

export const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const { id: userId } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const isMyProfilePage = session?.user.id === userId;

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
      <CardContent className="flex flex-col gap-4 md:mx-8">
        <H2>{userProfile?.name ?? ""}</H2>
        <DataList orientation="vertical" className="gap-3">
          {profile.map((item) => (
            <DataListItem key={item.label}>
              <DataListLabel>{item.label}:</DataListLabel>
              <DataListValue>{item.value}</DataListValue>
            </DataListItem>
          ))}
        </DataList>
        {isMyProfilePage && (
          <div className="flex justify-end">
            <TooltipWrapper label="プロフィール編集ページに移動">
              <Button variant="outline" size="icon" asChild>
                <Link href="/user/settings">
                  <MdOutlineEdit className="size-4" />
                  <span className="sr-only">編集</span>
                </Link>
              </Button>
            </TooltipWrapper>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
