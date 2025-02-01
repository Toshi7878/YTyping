import DateDistanceText from "@/components/custom-ui/DateDistanceText";
import UserLinkText from "@/components/custom-ui/UserLinkText";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Text } from "@chakra-ui/react";

interface MapCreateUserProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}

const MapCreateUser = (props: MapCreateUserProps) => {
  return (
    <Text as="small" mt={2}>
      <UserLinkText userId={props.map.creator.id} userName={props.map.creator.name as string} />
      <Text as="span" fontSize="xs" display={{ base: "none", md: "inline-block" }}>
        <Box mx={1}>
          - <DateDistanceText date={props.map.updated_at} />
        </Box>
      </Text>
    </Text>
  );
};

export default MapCreateUser;
