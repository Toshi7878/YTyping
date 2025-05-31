"use client";
import CustomDrawerContent from "@/components/custom-ui/CustomDrawerContent";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { useNewNotificationCheckQuery } from "@/util/global-hooks/query/notificationRouterQuery";
import { Box, Drawer, useDisclosure, useTheme } from "@chakra-ui/react";
import { Bell, BellDot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import NotifyDrawerInnerContent from "./child/NotifyDrawerInnerContent";

export default function NotifyBell() {
  const { data: isNewNotification } = clientApi.notification.newNotificationCheck.useQuery();
  const [isNewBadge, isSetNewBadge] = useState(isNewNotification);
  const theme: ThemeColors = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { data } = useNewNotificationCheckQuery();
  const postUserNotificationRead = clientApi.notification.postUserNotificationRead.useMutation();

  const nofityDrawerClose = useCallback(() => {
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
      <CustomToolTip key={isNewBadge ? "new" : "old"} placement="bottom" label="通知" fontSize="xs" openDelay={600}>
        <Box color={theme.colors.text.header.normal} cursor="pointer" onClick={notificationOpen}>
          <Box
            position="relative"
            top="0.5px"
            boxShadow="xl"
            color={isNewBadge ? theme.colors.text.body : theme.colors.text.header.normal}
            _hover={{
              color: theme.colors.text.header.hover,
            }}
            p={2}
          >
            {isNewBadge ? <BellDot size={18} strokeWidth={2.5} /> : <Bell size={18} strokeWidth={2.5} />}
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
