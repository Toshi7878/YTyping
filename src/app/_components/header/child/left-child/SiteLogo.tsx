import { ThemeColors } from "@/types";
import { useLinkClick } from "@/util/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Text, useTheme } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

function SiteLogo() {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();
  const pathname = usePathname();
  return (
    <Link
      href={pathname === "/user/register" ? "/user/register" : "/"}
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
