import { useAtomValue } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { store } from "./provider";

const notificationsAtom = atomWithReset<string[]>([]);

export const useNotificationsState = () => useAtomValue(notificationsAtom, { store });
export const addNotifications = (notifications: string[]) =>
  store.set(notificationsAtom, (prev) => [...prev, ...notifications]);
export const resetNotifications = () => store.set(notificationsAtom, RESET);

export const Notifications = ({ style }: { style: CSSProperties }) => {
  const notifications = useNotificationsState();
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: notifications.length変更時のみ発火させたいため
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [notifications.length]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute top-[45px] left-0 z-200 w-full cursor-pointer overflow-y-hidden font-bold text-xl leading-7"
      style={{
        fontFamily: "Yu Gothic Ui",
        textShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
        ...style,
      }}
    >
      {notifications.map((notification) => (
        <div key={notification}>{notification}</div>
      ))}
    </div>
  );
};
