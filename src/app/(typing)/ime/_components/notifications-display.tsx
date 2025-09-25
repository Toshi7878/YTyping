import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useNotificationsState } from "../_lib/atoms/state-atoms";

const Notifications = ({ style }: { style: CSSProperties }) => {
  const notifications = useNotificationsState();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [notifications]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute top-[45px] left-0 z-[200] w-full cursor-pointer overflow-y-hidden text-xl leading-7 font-bold"
      style={{
        fontFamily: "Yu Gothic Ui",
        textShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
        ...style,
      }}
    >
      {notifications.map((notification, index) => (
        <div key={index}>{notification}</div>
      ))}
    </div>
  );
};

export default Notifications;
