"use client";
import { ResultCardInfo } from "@/app/timeline/ts/type";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, Text, useTheme } from "@chakra-ui/react";

interface MapCardProps {
  map: ResultCardInfo["map"];
  isToggledInputMode: boolean;
}
function MapInfo({ map, isToggledInputMode }: MapCardProps) {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <Flex direction="column" gap={1} justifyContent="space-between">
      <CustomToolTip
        label={`${map.title} / ${map.artistName}${map.musicSource ? `【${map.musicSource}】` : ""}`}
        placement="top"
      >
        <Link
          href={`/type/${map.id}`}
          onClick={handleLinkClick}
          color={theme.colors.secondary.main}
          width={["40vw", isToggledInputMode ? "16.5vw" : "20vw"]}
        >
          <Box
            fontWeight="bold"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontSize="md"
          >
            {`${map.title} / ${map.artistName}`}
          </Box>
        </Link>
      </CustomToolTip>
      <Box fontSize="xs">
        <Text as="span">
          制作者:{" "}
          <Link
            href={`/user/${map.user.id}`}
            onClick={handleLinkClick}
            color={theme.colors.secondary.main}
          >
            {map.user.name}
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default MapInfo;
