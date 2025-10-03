"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdOutlineEdit } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { H2 } from "@/components/ui/typography";
import type { RouterOutPuts } from "@/server/api/trpc";
import { FingerChartUrl } from "./user-info/finger-chart-url";
import { KeyBoard } from "./user-info/usage-keyboard";

interface UserProfileCardProps {
  userProfile: RouterOutPuts["userProfile"]["getUserProfile"];
}

export const UserProfileCard = ({ userProfile }: UserProfileCardProps) => {
  const { id: userId } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const myProfile = session?.user.id === userId;

  return (
    <Card>
      <CardContent className="mx-8">
        <div className="flex flex-col gap-4">
          <H2>{userProfile?.name ?? ""}</H2>
          <div className="flex flex-col gap-2">
            <FingerChartUrl url={userProfile?.fingerChartUrl ?? ""} />
            <KeyBoard keyboard={userProfile?.keyboard ?? ""} />
          </div>
          {myProfile && (
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
        </div>
      </CardContent>
    </Card>
  );
};
