import { MapCardInfo } from "@/app/(home)/ts/type";
import UpdateAtText from "@/components/custom-chakra-ui/UpdateAtText";
import { useLinkClick } from "@/lib/hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Text, useTheme } from "@chakra-ui/react";
import React from "react";

interface MapCreateUserProps {
  map: MapCardInfo;
}

const MapCreateUser = (props: MapCreateUserProps) => {
  const handleLinkClick = useLinkClick();
  const theme: ThemeColors = useTheme();

  return (
    <Text as="small" mt={2}>
      <Link
        href={`/user/${props.map.user.id}`}
        onClick={handleLinkClick}
        color={theme.colors.secondary.main}
      >
        {props.map.user.name}
      </Link>

      <Text as="span" fontSize="xs">
        {" "}
        - <UpdateAtText updatedAt={props.map.updatedAt} />
      </Text>
    </Text>
  );
};

export default MapCreateUser;