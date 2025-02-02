import CustomDrawerContent from "@/components/custom-ui/CustomDrawerContent";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useSetOnlineUsersAtom, useUserOptionsAtom } from "@/lib/global-atoms/globalAtoms";
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
  const userOptions = useUserOptionsAtom();

  const nofityDrawerClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const { data: session } = useSession();
  const setOnlineUsers = useSetOnlineUsersAtom();
  const pathname = usePathname();
  const { id: mapId } = useParams();

  useEffect(() => {
    if (!session?.user?.name) return;

    let inactivityTimer: number;
    let currentChannel: ReturnType<typeof supabase.channel> | null = null;

    const updateUserStatus = async (channelInstance: typeof currentChannel) => {
      if (!session?.user?.name || !channelInstance) return;
      const isType = pathname.match("/type/");
      const isEdit = pathname.match("/edit");
      const currentState =
        userOptions?.custom_user_active_state === "ASK_ME"
          ? "askMe"
          : isType
          ? "type"
          : isEdit
          ? "edit"
          : "idle";

      const userStatus: UserStatus = {
        id: Number(session.user.id),
        name: session.user.name,
        onlineAt: new Date(),
        state: currentState,
        mapId: currentState === "type" ? Number(mapId) : null,
      };

      await channelInstance.track(userStatus);
    };

    const createChannel = () => {
      const channel = supabase.channel("active_users_room", {
        config: {
          presence: { key: session.user.id },
        },
      });

      channel.on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<UserStatus>();
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

      channel.on(
        "presence",
        { event: "join" },
        ({ key, newPresences }: { key: string; newPresences: UserStatus[] }) => {
          console.log("join", key, newPresences);
          setOnlineUsers((prev) => [...prev, ...newPresences]);
        }
      );

      channel.on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => prev.filter((user) => user.id.toString() !== key));
      });

      // 初回 subscribe
      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !session?.user?.name) return;
        if (userOptions?.custom_user_active_state !== "HIDE_ONLINE") {
          await updateUserStatus(channel);
        }
      });

      return channel;
    };

    const ensureChannel = () => {
      if (!currentChannel) {
        currentChannel = createChannel();
        console.log("チャネルを新規生成し subscribe しました");
      }
    };

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      ensureChannel();
      inactivityTimer = window.setTimeout(() => {
        if (currentChannel) {
          console.log("一定時間操作がなかったのでチャネルを unsubscribe します");
          currentChannel.unsubscribe();
          currentChannel = null;
        }
      }, 60 * 1000);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (currentChannel) {
        currentChannel.unsubscribe();
      }
    };
  }, [
    pathname,
    session?.user.name,
    setOnlineUsers,
    mapId,
    session?.user.id,
    userOptions?.custom_user_active_state,
  ]);

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
