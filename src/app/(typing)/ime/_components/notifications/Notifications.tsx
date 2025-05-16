import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useNotificationsState } from "../../atom/stateAtoms";

const Notifications = ({ style }: { style: React.CSSProperties }) => {
  const notifications = useNotificationsState();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [notifications]);

  return (
    <Box
      ref={containerRef}
      fontFamily="Yu Gothic Ui"
      width="100%"
      fontWeight="bold"
      textShadow="0px 0px 10px rgba(0, 0, 0, 1)"
      fontSize="xl"
      zIndex={200}
      overflowY="hidden"
      position="absolute"
      top="40px"
      left="0"
      style={{ ...style }}
      cursor="pointer"
      pointerEvents="none"
    >
      {notifications.map((notification, index) => (
        <Box key={index}>{notification}</Box>
      ))}
    </Box>
  );
};

export default Notifications;
