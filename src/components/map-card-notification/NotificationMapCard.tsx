"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { CardBody, CardHeader, useTheme } from "@chakra-ui/react";
import CustomMapCard from "../custom-ui/CustomMapCard";
import UserLinkText from "../custom-ui/UserLinkText";

interface NotificationMapCardProps {
  notify: RouterOutPuts["notification"]["getInfiniteUserNotifications"]["notifications"][number];
  children: React.ReactNode;
}
function NotificationMapCard({ notify, children }: NotificationMapCardProps) {
  const theme: ThemeColors = useTheme();

  return (
    <CustomMapCard>
      <CardHeader fontSize="sm" py={2} px={2} bg={theme.colors.background.header} roundedTop="md">
        <UserLinkText userId={notify.visitor_id} userName={notify.visitor.name!} />
        さんがスコア {notify.visitorResult.status!.score -
          notify.visitedResult.status!.score} 差で {Number(notify.old_rank)}位 の記録を抜かしました
      </CardHeader>
      <CardBody
        color={theme.colors.text.body}
        bg={theme.colors.background.card}
        borderRadius="md"
        display="flex"
        alignItems="start"
        border="none"
        height="100%"
        p={0}
      >
        {children}
      </CardBody>
    </CustomMapCard>
  );
}

export default NotificationMapCard;
