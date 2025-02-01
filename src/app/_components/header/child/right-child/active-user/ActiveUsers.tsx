import CustomDrawerContent from "@/components/custom-ui/CustomDrawerContent";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useSetOnlineUsersAtom } from "@/lib/global-atoms/globalAtoms";
import { supabase } from "@/lib/supabaseClient";
import { ThemeColors } from "@/types";
import { UserStatus } from "@/types/global-types";
import { Box, Drawer, useDisclosure, useTheme } from "@chakra-ui/react";
import { Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import ActiveUsersInnerContent from "./child/ActiveUsersInnerContent";

export default function ActiveUsers() {
  const theme: ThemeColors = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const nofityDrawerClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const { data: session } = useSession();
  const setOnlineUsers = useSetOnlineUsersAtom();
  const pathname = usePathname();
  const { id: mapId } = useParams();

  useEffect(() => {
    if (!session?.user?.name) return;

    const roomOne = supabase.channel("active_users_room", {
      config: {
        presence: { key: session.user.id },
      },
    });
    let isSubscribed = false;
    let inactivityTimer: number;

    // ユーザー状態の更新処理を共通化
    const updateUserStatus = async () => {
      if (!session?.user?.name) return;
      const isType = pathname.match("/type/");
      const isEdit = pathname.match("/edit");
      const userStatus: UserStatus = {
        id: Number(session.user.id),
        name: session.user.name,
        onlineAt: new Date(),
        state: isType ? "type" : isEdit ? "edit" : "idle",
        mapId: Number(mapId),
      };
      await roomOne.track(userStatus);
    };

    // チャンネルへの再購読処理
    const subscribeChannel = () => {
      if (isSubscribed) return;
      roomOne.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !session?.user?.name) return;
        await updateUserStatus();
      });
      isSubscribed = true;
      console.log("操作が復活したので再度 subscribe しました");
    };

    // presence イベントの登録
    roomOne.on("presence", { event: "sync" }, () => {
      const newState = roomOne.presenceState<UserStatus>();
      const users = Object.keys(newState).map((key) => {
        const [userData] = newState[key];
        return {
          id: userData.id,
          name: userData.name,
          onlineAt: userData.onlineAt,
          state: userData.state,
          mapId: userData.mapId,
        };
      });
      setOnlineUsers(users);
    });

    roomOne.on(
      "presence",
      { event: "join" },
      ({ key, newPresences }: { key: string; newPresences: UserStatus[] }) => {
        console.log("join", key, newPresences);
        setOnlineUsers((prev) => [...prev, ...newPresences]);
      }
    );

    roomOne.on("presence", { event: "leave" }, ({ key }: { key: string }) => {
      setOnlineUsers((prev) => prev.filter((user) => user.id.toString() !== key));
    });

    // 初回の購読
    roomOne.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || !session?.user?.name) return;
      await updateUserStatus();
    });
    isSubscribed = true;

    // 不活性状態タイマーのリセット処理
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (!isSubscribed) subscribeChannel();
      inactivityTimer = window.setTimeout(() => {
        console.log("一定時間操作がなかったので unsubscribe を実行します");
        roomOne.unsubscribe();
        isSubscribed = false;
      }, 60 * 1000);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
      roomOne.unsubscribe();
    };
  }, [pathname, session?.user.name, setOnlineUsers, mapId, session?.user.id]);

  return (
    <>
      <CustomToolTip placement="bottom" label="アクティブユーザー" fontSize="xs" openDelay={600}>
        <Box
          color={theme.colors.text.header.normal}
          _hover={{
            color: theme.colors.text.header.hover,
          }}
          cursor="pointer"
          onClick={onOpen}
        >
          <Box position="relative" top="0.5px" boxShadow="xl">
            <Users size={18} strokeWidth={2.5} />
          </Box>
        </Box>
      </CustomToolTip>

      <Drawer isOpen={isOpen} placement="right" onClose={nofityDrawerClose}>
        <CustomDrawerContent width={{ base: "auto", lg: "400px" }}>
          <ActiveUsersInnerContent />
        </CustomDrawerContent>
      </Drawer>
    </>
  );
}
