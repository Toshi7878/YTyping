"use client";

import { UserOptions, useUserOptionsState } from "@/lib/global-atoms/globalAtoms";
import { supabase } from "@/lib/supabaseClient";
import { ActiveUserStatus } from "@/types/global-types";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

const getUserCurrentState = (pathname: string, userOptions: UserOptions, mapId: string | string[] | undefined) => {
  if (userOptions?.custom_user_active_state === "ASK_ME") return "askMe";

  const isType = pathname.match("/type/") || pathname.match("/ime/");
  const isEdit = pathname.match("/edit");

  if (isType) return "type";
  if (isEdit) return "edit";
  return "idle";
};

const useSupabaseChannel = (
  session: Session | null,
  setOnlineUsers: Dispatch<SetStateAction<ActiveUserStatus[]>>,
  updateUserStatus: (channel: RealtimeChannel) => Promise<void>,
  userOptions: UserOptions,
) => {
  const createChannel = useCallback(() => {
    const channel = supabase.channel("active_users_room", {
      config: {
        presence: { key: session?.user.id },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState<ActiveUserStatus>();
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
      ({ key, newPresences }: { key: string; newPresences: ActiveUserStatus[] }) => {
        setOnlineUsers((prev: ActiveUserStatus[]) => [...prev, ...newPresences]);
      },
    );

    channel.on("presence", { event: "leave" }, ({ key }: { key: string }) => {
      setOnlineUsers((prev: ActiveUserStatus[]) => prev.filter((user) => user.id.toString() !== key));
    });

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED" || !session?.user?.name) return;
      if (userOptions?.custom_user_active_state !== "HIDE_ONLINE") {
        await updateUserStatus(channel);
      }
    });

    return channel;
  }, [session?.user?.id, session?.user?.name, setOnlineUsers, updateUserStatus, userOptions?.custom_user_active_state]);

  return { createChannel };
};

const useInactivityTimer = (currentChannelRef: React.RefObject<RealtimeChannel | null>, createChannel: () => any) => {
  const inactivityTimerRef = useRef<number | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // チャンネルが存在しない場合は作成
    if (!currentChannelRef.current) {
      currentChannelRef.current = createChannel();
    }

    // 60秒後に非アクティブとしてチャンネルを切断
    inactivityTimerRef.current = window.setTimeout(() => {
      if (currentChannelRef.current) {
        currentChannelRef.current.unsubscribe();
        currentChannelRef.current = null;
      }
    }, 60 * 1000);
  }, [createChannel, currentChannelRef]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  return { resetInactivityTimer, clearInactivityTimer };
};

export const useActiveUsers = () => {
  const userOptions = useUserOptionsState();
  const { data: session } = useSession();
  const pathname = usePathname();
  const { id: mapId } = useParams();

  const currentChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<ActiveUserStatus[]>([]);

  const updateUserStatus = useCallback(
    async (channelInstance: RealtimeChannel) => {
      if (!session?.user?.name || !channelInstance) return;

      const currentState = getUserCurrentState(pathname, userOptions, mapId);

      const userStatus: ActiveUserStatus = {
        id: Number(session.user.id),
        name: session.user.name,
        onlineAt: new Date(),
        state: currentState,
        mapId: currentState === "type" ? Number(mapId) : null,
      };

      await channelInstance.track(userStatus);
    },
    [session?.user?.name, session?.user?.id, pathname, userOptions, mapId],
  );

  const { createChannel } = useSupabaseChannel(session, setOnlineUsers, updateUserStatus, userOptions);

  const { resetInactivityTimer, clearInactivityTimer } = useInactivityTimer(currentChannelRef, createChannel);

  useEffect(() => {
    if (!session?.user?.name) return;

    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer();

    const currentChannel = currentChannelRef.current;

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      clearInactivityTimer();
      if (currentChannel) {
        currentChannel.unsubscribe();
      }
    };
  }, [
    pathname,
    session?.user.name,
    session?.user.id,
    userOptions?.custom_user_active_state,
    resetInactivityTimer,
    clearInactivityTimer,
  ]);

  return { onlineUsers };
};
