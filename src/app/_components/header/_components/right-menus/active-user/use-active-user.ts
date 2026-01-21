import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import type { ActiveUserStatus } from "@/lib/atoms/global-atoms";
import { useSetOnlineUsers } from "@/lib/atoms/global-atoms";
import { createPresenceChannel } from "@/lib/supabase-client";
import { useTRPC } from "@/trpc/provider";

export const useActiveUsers = () => {
  const trpc = useTRPC();
  const { data: userOptions, isPending } = useQuery(
    trpc.user.option.getForSession.queryOptions(undefined, {
      gcTime: Infinity,
      staleTime: Infinity,
    }),
  );

  const { data: session } = useSession();
  const setOnlineUsers = useSetOnlineUsers();
  const pathname = usePathname();
  const { id: mapId } = useParams();

  useEffect(() => {
    if (!session?.user?.name || isPending) return;

    let inactivityTimer: number;
    let currentChannel: ReturnType<typeof createPresenceChannel> | null = null;

    const updateUserStatus = async (channelInstance: typeof currentChannel) => {
      if (!session?.user?.name || !channelInstance) return;
      const isType = pathname.match("/type/") || pathname.match("/ime/");
      const isEdit = pathname.match("/edit");

      const currentState =
        userOptions?.presenceState === "ASK_ME" ? "askMe" : isType ? "type" : isEdit ? "edit" : "idle";

      const userStatus: ActiveUserStatus = {
        id: Number(session.user.id),
        name: session.user.name,
        onlineAt: new Date(),
        state: currentState,
        mapId: currentState === "type" ? Number(mapId) : null,
      };

      await channelInstance.track(userStatus);
    };

    const createChannel = () => {
      const channel = createPresenceChannel("active_users_room", session.user.id);

      channel.on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<ActiveUserStatus>();
        const users = Object.keys(newState)
          .map((key) => {
            const [userData] = newState[key] ?? [];
            if (!userData) return null;
            return {
              id: userData.id,
              name: userData.name,
              onlineAt: userData.onlineAt,
              state: userData.state,
              mapId: userData.mapId,
            };
          })
          .filter((user) => user !== null);
        setOnlineUsers(users);
      });

      channel.on("presence", { event: "join" }, ({ newPresences }: { newPresences: ActiveUserStatus[] }) => {
        setOnlineUsers((prev) => [...prev, ...newPresences]);
      });

      channel.on("presence", { event: "leave" }, ({ key }: { key: string }) => {
        setOnlineUsers((prev) => prev.filter((user) => user.id.toString() !== key));
      });

      // 初回 subscribe
      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !session?.user?.name) return;
        if (userOptions?.presenceState !== "HIDE_ONLINE") {
          await updateUserStatus(channel);
        }
      });

      return channel;
    };

    const ensureChannel = () => {
      if (!currentChannel) {
        currentChannel = createChannel();
      }
    };

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      ensureChannel();
      inactivityTimer = window.setTimeout(() => {
        if (currentChannel) {
          void currentChannel.unsubscribe();
          currentChannel = null;
        }
      }, 60 * 1000);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    for (const event of activityEvents) {
      window.addEventListener(event, resetInactivityTimer);
    }
    resetInactivityTimer();

    return () => {
      for (const event of activityEvents) {
        window.removeEventListener(event, resetInactivityTimer);
      }
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (currentChannel) {
        void currentChannel.unsubscribe();
      }
    };
  }, [isPending, pathname, session?.user.name, setOnlineUsers, mapId, session?.user.id, userOptions?.presenceState]);
};
