"use client";
import CustomDrawerContent from "@/components/custom-ui/CustomDrawerContent";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Box, Drawer, useDisclosure, useTheme } from "@chakra-ui/react";
import { Bell, BellDot } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import NotifyDrawerInnerContent from "./child/NotifyDrawerInnerContent";

interface NotifyBellProps {
  isNewNotification: boolean;
}

export default function NotifyBell({ isNewNotification }: NotifyBellProps) {
  const [isNewBadge, isSetNewBadge] = useState(isNewNotification);
  const theme: ThemeColors = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Drawerの開閉状態を管理
  const router = useRouter();
  const { data } = clientApi.notification.newNotificationCheck.useQuery();
  const postUserNotificationRead = clientApi.notification.postUserNotificationRead.useMutation();
  const utils = clientApi.useUtils();
  const nofityDrawerClose = useCallback(() => {
    utils.notification.getInfiniteUserNotifications.invalidate();
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notificationOpen = useCallback(() => {
    postUserNotificationRead.mutate();
    isSetNewBadge(false);
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      isSetNewBadge(true);
    }
  }, [router, data]);
  return (
    <>
      <CustomToolTip
        key={isNewBadge ? "new" : "old"}
        placement="bottom"
        tooltipLabel="通知"
        fontSize="xs"
        openDelay={600}
      >
        <Box
          color={theme.colors.text.header.normal}
          _hover={{
            color: theme.colors.text.header.hover,
          }}
          cursor="pointer"
          onClick={notificationOpen}
        >
          <Box
            position="relative"
            top="0.5px"
            boxShadow="xl"
            color={isNewBadge ? theme.colors.text.body : theme.colors.text.header.normal}
          >
            {isNewBadge ? (
              <BellDot size={18} strokeWidth={2.5} />
            ) : (
              <Bell size={18} strokeWidth={2.5} />
            )}
          </Box>
        </Box>
      </CustomToolTip>

      <Drawer isOpen={isOpen} placement="right" onClose={nofityDrawerClose}>
        <CustomDrawerContent width={{ base: "auto", lg: "450px" }}>
          <NotifyDrawerInnerContent />
        </CustomDrawerContent>
      </Drawer>
    </>
  );
}
