"use client";
import { getGlobalAtomStore, previewVideoIdAtom } from "@/lib/global-atoms/globalAtoms";
import { useActiveUsersRoom } from "@/lib/global-hooks/useActiveUsersRoom";
import { RouterOutPuts } from "@/server/api/trpc";
import { UserStatus } from "@/types/global-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider as JotaiProvider } from "jotai";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  hasLocalLikeAtom,
  mapInfoAtom,
  mapUpdatedAtAtom,
  userOptionsAtom,
} from "../type-atoms/gameRenderAtoms";
import { RefsProvider } from "../type-contexts/refsProvider";

const typeAtomStore = createStore();
export const getTypeAtomStore = () => typeAtomStore;
const queryClient = new QueryClient();

interface TypeProviderProps {
  mapInfo: NonNullable<RouterOutPuts["map"]["getMapInfo"]>;
  userTypingOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"];
  children: React.ReactNode;
}
const TypeProvider = ({ mapInfo, userTypingOptions, children }: TypeProviderProps) => {
  const globalAtomStore = getGlobalAtomStore();
  const activeUsersRoom = useActiveUsersRoom();
  const { data: session } = useSession();
  typeAtomStore.set(hasLocalLikeAtom, !!mapInfo.map_likes[0]?.is_liked);
  typeAtomStore.set(mapInfoAtom, mapInfo);
  const { id: mapId } = useParams();

  const updateActiveRoomStatus = async () => {
    if (session?.user.name) {
      const userStatus: UserStatus = {
        id: Number(session.user.id),
        name: session.user.name,
        onlineAt: new Date(),
        state: "type",
        mapId: Number(mapId),
      };

      const roomOne = activeUsersRoom(session.user.id);
      await roomOne.track(userStatus);
    }
  };

  useEffect(() => {
    // 状態の更新をuseEffect内に移動
    globalAtomStore.set(previewVideoIdAtom, null);
    typeAtomStore.set(mapUpdatedAtAtom, mapInfo!.updated_at);
    if (userTypingOptions) {
      typeAtomStore.set(userOptionsAtom, userTypingOptions);
    }

    updateActiveRoomStatus();

    window.getSelection()!.removeAllRanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfo, userTypingOptions]);
  return (
    <QueryClientProvider client={queryClient}>
      <RefsProvider>
        <JotaiProvider store={typeAtomStore}>{children}</JotaiProvider>
      </RefsProvider>
    </QueryClientProvider>
  );
};

export default TypeProvider;
