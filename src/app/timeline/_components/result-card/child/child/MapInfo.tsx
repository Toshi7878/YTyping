"use client";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
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
    <Flex direction="column" gap={1} justifyContent="space-between" {...rest}>
      <CustomToolTip
        label={`${map.title} / ${map.artist_name}${
          map.music_source ? `【${map.music_source}】` : ""
        }`}
        placement="top"
      >
        <Link
          href={`/type/${map.id}`}
          onClick={handleLinkClick}
          color={theme.colors.secondary.main}
        >
          <Box
            fontWeight="bold"
            fontSize="md"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {`${map.title} / ${map.artist_name}`}
          </Box>
        </Link>
      </CustomToolTip>
      <Box fontSize="xs">
        <Text as="span">
          制作者:{" "}
          <Link
            href={`/user/${map.creator.id}`}
            onClick={handleLinkClick}
            color={theme.colors.secondary.main}
          >
            {map.creator.name}
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default MapInfo;
