"use client";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { RouterOutPuts } from "@/server/api/trpc";
import { ThemeColors } from "@/types";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Box, Flex, Stack, useTheme } from "@chakra-ui/react";
import MapBadges from "./MapBadgesLayout";
import MapCreateUser from "./MapCreateUser";

interface MapInfoProps {
  map: RouterOutPuts["mapList"]["getByVideoId"][number];
}
function MapInfo({ map }: MapInfoProps) {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      flexDirection="column"
      height="100%"
      _hover={{ textDecoration: "none" }}
      pl={3}
      pt={2}
    >
      <Flex direction="column" gap={1}>
        <CustomToolTip
          label={`${map.title} / ${map.artist_name}${map.music_source ? `【${map.music_source}】` : ""}`}
          placement="top"
          right={24}
        >
          <Link
            href={`/type/${map.id}`}
            onClick={handleLinkClick}
            zIndex={1}
            _hover={{ textDecoration: "none" }}
            color={theme.colors.secondary.main}
            fontWeight="bold"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontSize="md"
          >
            {map.title}
          </Link>
        </CustomToolTip>

        <Box
          fontSize={{ base: "xs", sm: "sm" }}
          color={theme.colors.secondary.main}
          fontWeight="bold"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {map.artist_name || ""}
          {map.music_source ? `【${map.music_source}】` : ""}
        </Box>
      </Flex>
      <Stack justifyContent="space-between" alignItems="baseline" flexDirection={{ base: "row", lg: "column" }}>
        <MapCreateUser map={map} />
        <MapBadges map={map} />
      </Stack>
    </Box>
  );
}

export default MapInfo;
