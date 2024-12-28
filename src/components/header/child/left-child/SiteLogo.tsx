import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { ThemeColors } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { Text, useTheme } from "@chakra-ui/react";

function SiteLogo() {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();
  return (
    <Link
      href={"/"}
      onClick={handleLinkClick}
      fontSize="2xl"
      position="relative"
      top={"-2.5px"}
      color={theme.colors.text.body}
      _hover={{
        color: theme.colors.text.header.hover,
        bg: `${theme.colors.secondary.main}30`,
      }}
      px={2}
      userSelect="none"
    >
      <Text as="span" fontWeight="bold">
        Y
      </Text>
      <Text as="span" fontWeight="bold">
        Typing
      </Text>
    </Link>
  );
}

export default SiteLogo;
