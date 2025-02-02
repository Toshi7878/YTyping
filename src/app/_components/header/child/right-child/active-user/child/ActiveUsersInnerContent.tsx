import DateDistanceText from "@/components/custom-ui/DateDistanceText";
import { useOnlineUsersAtom } from "@/lib/global-atoms/globalAtoms";
import { Link } from "@chakra-ui/next-js";
import { Table, Tbody, Td, Thead, Tr } from "@chakra-ui/react";

const ActiveUsersInnerContent = () => {
  const onlineUsers = useOnlineUsersAtom();
  return (
    <Table>
      <Thead>
        <Tr>
          <Td>名前</Td>
          <Td>状態</Td>
          <Td>曲名</Td>
          <Td>時間</Td>
        </Tr>
      </Thead>
      <Tbody>
        {onlineUsers.map((user) => {
          const stateMsg =
            user.state === "askMe"
              ? "Ask Me"
              : user.state === "type"
              ? "プレイ中"
              : user.state === "edit"
              ? "譜面編集中"
              : "待機中";

          return (
            <Tr key={user.id} gap={2}>
              <Td isTruncated w="full">
                <Link
                  href={`/user/${user.id}`}
                  w="full"
                  display="block"
                  _hover={{ textDecoration: "none", bg: "gray.100" }}
                >
                  {user.name}
                </Link>
              </Td>
              <Td isTruncated>
                {user.state === "type" ? (
                  <Link href={`/type/${user.mapId}`} w="full" display="block">
                    {stateMsg}
                  </Link>
                ) : (
                  stateMsg
                )}
              </Td>
              <Td>
                {user.state === "type" && <Link href={`/type/${user.mapId}`}>{user.mapId}</Link>}
              </Td>
              <Td>
                <DateDistanceText date={new Date(user.onlineAt)} addSuffix={false} />
              </Td>
            </Tr>
          );
        })}
        <Tr></Tr>
      </Tbody>
    </Table>
  );
};

export default ActiveUsersInnerContent;
