"use client";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, Stack, useTheme } from "@chakra-ui/react";
import MapBadges from "./MapBadgesLayout";
import MapCreateUser from "./MapCreateUser";

interface MapInfoProps {
  map: RouterOutPuts["map"]["getCreatedVideoIdMapList"][number];
}
function MapInfo({ map }: MapInfoProps) {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <Link
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      height="100%"
      _hover={{ textDecoration: "none" }}
      href={`/type/${map.id}`}
      onClick={handleLinkClick}
      scroll={false}
    >
      <Flex direction="column" gap={1}>
        <CustomToolTip
          label={`${map.title} / ${map.artistName}${
            map.musicSource ? `【${map.musicSource}】` : ""
          }`}
          placement="top"
        >
          <Box
            color={theme.colors.secondary.main}
            fontWeight="bold"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontSize="md"
          >
            {map.title}
          </Box>
        </CustomToolTip>

        <Box
          fontSize={{ base: "xs", sm: "sm" }}
          color={theme.colors.secondary.main}
          fontWeight="bold"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {map.artistName || "\u00A0"}
          {map.musicSource ? `【${map.musicSource}】` : "\u00A0"}
        </Box>
      </Flex>
      <Stack
        justifyContent="space-between"
        alignItems="baseline"
        flexDirection={{ base: "row", lg: "column" }}
      >
        <MapCreateUser map={map} />
        <MapBadges map={map} />
      </Stack>
    </Link>
  );
}

export default MapInfo;
