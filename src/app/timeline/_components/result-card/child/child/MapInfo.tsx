"use client";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, FlexProps, Text, useTheme } from "@chakra-ui/react";

interface MapCardProps extends FlexProps {
  map: ResultCardInfo["map"];
  isToggledInputMode: boolean;
}
function MapInfo({ map, isToggledInputMode, ...rest }: MapCardProps) {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <Flex direction="column" justifyContent="space-between" {...rest} mt={2} mb={3}>
      <CustomToolTip
        label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}
        placement="top"
        right={19}
      >
        <Link href={`/type/${map.id}`} onClick={handleLinkClick} color={theme.colors.secondary.main}>
          <Box fontWeight="bold" fontSize="md" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {`${map.title} / ${map.artist_name}`}
          </Box>
        </Link>
      </CustomToolTip>
      <Box fontSize="xs">
        <Text as="span">
          制作者:{" "}
          <Link href={`/user/${map.creator.id}`} onClick={handleLinkClick} color={theme.colors.secondary.main}>
            {map.creator.name}
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default MapInfo;
