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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: session } = useSession();
  const setOnlineUsers = useSetOnlineUsersAtom();
  const pathname = usePathname();
  const { id: mapId } = useParams();

  useEffect(() => {
    if (!session?.user?.name) return;

    const roomOne = supabase.channel("active_users_room", {
      config: {
        presence: {
          key: session?.user?.id,
        },
      },
    });

    roomOne
      .on("presence", { event: "sync" }, () => {
        const newState = roomOne.presenceState<UserStatus>();
        const users = Object.keys(newState).map((key) => ({
          id: newState[key][0].id,
          name: newState[key][0].name,
          onlineAt: newState[key][0].onlineAt,
          state: newState[key][0].state,
          mapId: newState[key][0].mapId,
        }));
        setOnlineUsers(users);
      })
      .on(
        "presence",
        { event: "join" },
        ({ key, newPresences }: { key: string; newPresences: UserStatus[] }) => {
          console.log("join", key, newPresences);
          setOnlineUsers((prev) => [...prev, ...newPresences]);
        }
      )
      .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => prev.filter((user) => user.id.toString() !== key));
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !session?.user?.name) {
          return;
        }

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
      });

    // 一定時間操作がなかった場合にunsubscribeするためのタイマー
    let inactivityTimer: number;

    // 操作が行われたらタイマーをリセットする処理
    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = window.setTimeout(() => {
        console.log("一定時間操作がなかったので unsubscribe を実行します");
        roomOne.unsubscribe();
        removeActivityListeners();
      }, 60 * 10000);
    };

    // イベントリスナーの登録
    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    const addActivityListeners = () => {
      activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    };

    const removeActivityListeners = () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };

    addActivityListeners();
    resetInactivityTimer();

    return () => {
      removeActivityListeners();
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      roomOne.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
