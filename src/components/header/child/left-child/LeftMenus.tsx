import { ThemeColors } from "@/types";

import { leftLink, leftMenuItem } from "@/config/headerNav";
import { useLinkClick } from "@/lib/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Box, Button, Menu, MenuButton, MenuList, useTheme } from "@chakra-ui/react";
import LinkMenuItem from "../child/LinkMenuItem";

function LeftMenus() {
  const theme: ThemeColors = useTheme();
  const handleLinkClick = useLinkClick();

  return (
    <Box as="nav" display={{ base: "none", md: "block" }}>
      <Menu placement="bottom">
        <MenuButton
          cursor="pointer"
          color={theme.colors.text.header.normal}
          _hover={{
            color: theme.colors.text.header.hover,
          }}
          className="dropdown-toggle"
          fontSize="sm"
          _active={{ color: theme.colors.text.header.hover }}
        >
          Menu
        </MenuButton>
        <MenuList bg={theme.colors.background.body} minW="fit-content">
          {leftMenuItem.map((menuItem, index) => {
            return <LinkMenuItem key={index} title={menuItem.title} href={menuItem.href} />;
          })}
        </MenuList>
      </Menu>
      {leftLink.map((link, index) => {
        return (
          <Link
            as={Button}
            key={index}
            href={link.href}
            cursor="pointer"
            color={theme.colors.text.header.normal}
            _hover={{
              color: theme.colors.text.header.hover,
            }}
            fontSize="sm"
            _active={{ color: theme.colors.text.header.hover }}
            ml={5}
            onClick={handleLinkClick}
          >
            {link.title}
          </Link>
        );
      })}
    </Box>
  );
}

export default LeftMenus;
