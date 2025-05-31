"use client";

import { leftLink, leftMenuItem, loginMenuItem } from "@/config/headerNav";
import { ThemeColors } from "@/types";
import { useUserAgent } from "@/util/useUserAgent";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Box, IconButton, Menu, MenuButton, MenuDivider, MenuList, useDisclosure, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import LinkMenuItem from "../child/child/LinkMenuItem";
import LogOutMenuItem from "../child/right-child/login/child/LogOutMenuItem";
import SignInMenuItem from "../child/right-child/login/child/SignInMenuItem";

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu = ({ className }: HamburgerMenuProps) => {
  const { onOpen } = useDisclosure();
  const theme: ThemeColors = useTheme();
  const { data: session } = useSession();
  const { isMobile } = useUserAgent();

  const menus = leftMenuItem.concat(leftLink);
  return (
    <Box alignItems="center" gap={5} className={className}>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          size={"sm"}
          variant={"outline"}
        />
        <MenuList bg={theme.colors.background.body} minW="fit-content">
          {menus.reverse().map((menuItem, index) => {
            if (isMobile === undefined) {
              return null;
            }
            if ((menuItem.device === "PC" && !isMobile) || !menuItem.device) {
              return <LinkMenuItem key={index} title={menuItem.title} href={menuItem.href} />;
            }
            return null;
          })}
          <MenuDivider />

          {session?.user?.name ? (
            <>
              {loginMenuItem.map((item, index) => {
                return <LinkMenuItem key={index} title={item.title} href={item.href} />;
              })}
              <LogOutMenuItem />
            </>
          ) : (
            !session && (
              <>
                <SignInMenuItem
                  _hover={{ bg: "#7289DA", color: "white" }}
                  text={"Discordでログイン"}
                  leftIcon={<BsDiscord size="1.5em" />}
                  provider="discord"
                />
                <SignInMenuItem
                  _hover={{ bg: "#DB4437", color: "white" }}
                  text={"Googleでログイン"}
                  leftIcon={<BsGoogle size="1.5em" />}
                  provider="google"
                />
              </>
            )
          )}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default HamburgerMenu;
