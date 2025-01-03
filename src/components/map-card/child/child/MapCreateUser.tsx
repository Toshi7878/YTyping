import UpdateAtText from "@/components/custom-ui/UpdateAtText";
import UserLinkText from "@/components/custom-ui/UserLinkText";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Text } from "@chakra-ui/react";

interface MapCreateUserProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}

const MapCreateUser = (props: MapCreateUserProps) => {
  return (
    <Text as="small" mt={2}>
      <UserLinkText userId={props.map.user.id} userName={props.map.user.name as string} />
      <Text as="span" fontSize="xs" display={{ base: "none", sm: "inline-block" }}>
        <Box mx={1}>
          - <UpdateAtText updatedAt={props.map.updatedAt} />
        </Box>
      </Text>
    </Text>
  );
};

export default MapCreateUser;
