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
import { Badge, Flex, Table, Tbody, Td, Text, Thead, Tr, useTheme } from "@chakra-ui/react";

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
        "tbody td": {
          paddingX: 0,
          paddingY: 2,
        },
        "thead td": {
          paddingY: 3,
        },
      }}
    >
      <Thead>
        <Tr fontSize="sm">
          <Td w="25%" paddingX="0.75rem">
            <Flex alignItems="baseline" gap={1} whiteSpace="nowrap">
              <Text as="span">ユーザー</Text>
              <Badge size="sm">{onlineUsers.length}人</Badge>
            </Flex>
          </Td>
          <Td w="75%" paddingX={"17.5px"}>
            プレイ中譜面
          </Td>
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
                <Td>
                  <Link
                    href={`/user/${user.id}`}
                    display="block"
                    fontSize="sm"
                    paddingY="1rem"
                    paddingX="0.75rem"
                    isTruncated
                  >
                    {user.name}
                  </Link>
                </Td>
                <Td>
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
                        thumnailWidth={ACTIVE_USER_MAP_THUBNAIL_WIDTH}
                        thumnailHeight={ACTIVE_USER_MAP_THUBNAIL_HEIGHT}
                      />
                      <Flex
                        position="absolute"
                        top="50%"
                        transform="translateY(-50%)"
                        left={user.state === "edit" ? "20.5px" : "32.5px"}
                      >
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
