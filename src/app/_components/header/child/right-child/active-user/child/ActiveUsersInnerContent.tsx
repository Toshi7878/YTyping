import ActiveUserMapCard from "@/components/map-card-notification/ActiveUserMapCard";
import NotificationMapInfo from "@/components/map-card-notification/child/child/NotificationMapInfo";
import NotificationMapCardRightInfo from "@/components/map-card-notification/child/NotificationMapCardRightInfo";
import MapLeftThumbnail from "@/components/share-components/MapCardThumbnail";
import {
  ACTIVE_USER_MAP_THUBNAIL_HEIGHT,
  ACTIVE_USER_MAP_THUBNAIL_WIDTH,
} from "@/config/consts/globalConst";
import { useOnlineUsersAtom } from "@/lib/global-atoms/globalAtoms";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Flex, Table, Tbody, Td, Thead, Tr, useTheme } from "@chakra-ui/react";

const ActiveUsersInnerContent = () => {
  const onlineUsers = useOnlineUsersAtom();
  const { data: mapedActiveUserList, isLoading } =
    clientApi.activeUser.getUserPlayingMaps.useQuery(onlineUsers);
  const theme: ThemeColors = useTheme();

  if (isLoading) {
    return;
  }
  return (
    <Table
      style={{ tableLayout: "fixed" }}
      sx={{
        td: {
          border: "none",
          borderBottom: "1px",
          borderColor: `${theme.colors.border.card}30`,
        },
        th: {
          paddingY: { base: "1.3rem", md: "6px" },
        },
      }}
    >
      <Thead>
        <Tr fontSize="sm">
          <Td w="25%">名前</Td>
          <Td w="75%">プレイ中譜面</Td>
        </Tr>
      </Thead>
      <Tbody>
        {mapedActiveUserList &&
          mapedActiveUserList.map((user) => {
            const stateMsg =
              user.state === "askMe"
                ? "Ask Me"
                : user.state === "type"
                ? "プレイ中"
                : user.state === "edit"
                ? "譜面編集中"
                : "待機中";

            return (
              <Tr key={user.id}>
                <Td isTruncated paddingY={0} paddingX={0}>
                  <Link
                    href={`/user/${user.id}`}
                    display="block"
                    fontSize="sm"
                    paddingY="1rem"
                    paddingX="0.75rem"
                  >
                    {user.name}
                  </Link>
                </Td>
                <Td paddingY={0} paddingX={0}>
                  {user.state === "type" && user.map ? (
                    <ActiveUserMapCard>
                      <MapLeftThumbnail
                        alt={user.map.title}
                        fallbackSrc={`https://i.ytimg.com/vi/${user.map.video_id}/mqdefault.jpg`}
                        mapVideoId={user.map.video_id}
                        mapPreviewTime={user.map.preview_time}
                        thumbnailQuality={user.map.thumbnail_quality}
                        thumnailWidth={ACTIVE_USER_MAP_THUBNAIL_WIDTH}
                        thumnailHeight={ACTIVE_USER_MAP_THUBNAIL_HEIGHT}
                      />
                      <NotificationMapCardRightInfo>
                        <NotificationMapInfo map={user.map} />
                      </NotificationMapCardRightInfo>
                    </ActiveUserMapCard>
                  ) : (
                    <ActiveUserMapCard>
                      <MapLeftThumbnail
                        thumnailWidth={{ base: 0 }}
                        thumnailHeight={ACTIVE_USER_MAP_THUBNAIL_HEIGHT}
                      />
                      <Flex position="absolute" top="50%" transform="translateY(-50%)" left="25px">
                        {stateMsg}
                      </Flex>
                    </ActiveUserMapCard>
                  )}
                </Td>
              </Tr>
            );
          })}
      </Tbody>
    </Table>
  );
};

export default ActiveUsersInnerContent;
