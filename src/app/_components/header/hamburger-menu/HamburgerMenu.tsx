"use client";

import { leftLink, leftMenuItem, loginMenuItem } from "@/config/headerNav";
import { ThemeColors } from "@/types";
import { useUserAgent } from "@/util/useUserAgent";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  ResponsiveValue,
  useDisclosure,
  useTheme,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import LinkMenuItem from "../child/child/LinkMenuItem";
import ActiveUsers from "../child/right-child/active-user/ActiveUsers";
import LogOutMenuItem from "../child/right-child/login/child/LogOutMenuItem";
import SignInMenuItem from "../child/right-child/login/child/SignInMenuItem";
import CreateNewMapModal from "../child/right-child/new-map/child/CreateNewMapModal";
import NotifyBell from "../child/right-child/notify-bell/NotifyBell";

interface HamburgerMenuProps {
  display: ResponsiveValue<string>;
  isNewNotification: boolean;
}

const HamburgerMenu = ({ display, isNewNotification }: HamburgerMenuProps) => {
  const { onOpen } = useDisclosure();
  const theme: ThemeColors = useTheme();
  const { data: session } = useSession();
  const newCreateModalDisclosure = useDisclosure();
  const { isMobile } = useUserAgent();

  const menus = leftMenuItem.concat(leftLink);
  return (
    <Flex display={display} alignItems="center" gap={5}>
      {session?.user?.name && (
        <>
          <ActiveUsers />
          <NotifyBell isNewNotification={isNewNotification} />
        </>
      )}
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
          {menus.map((menuItem, index) => {
            if ((menuItem.device === "PC" && !isMobile) || !menuItem.device) {
              return <LinkMenuItem key={index} title={menuItem.title} href={menuItem.href} />;
            }
            return null;
          })}
          {session?.user?.name ? (
            <>
              <MenuItem
                onClick={newCreateModalDisclosure.onOpen}
                bg={theme.colors.background.body}
                color={theme.colors.text.body}
                _hover={{
                  bg: theme.colors.background.header,
                }}
              >
                譜面新規作成
              </MenuItem>
              <MenuDivider />
              {loginMenuItem.map((item, index) => {
                return <LinkMenuItem key={index} title={item.title} href={item.href} />;
              })}
              <LogOutMenuItem />
            </>
          ) : (
            !session && (
              <>
                <MenuDivider />

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

      {newCreateModalDisclosure.isOpen && <CreateNewMapModal newCreateModalDisclosure={newCreateModalDisclosure} />}
    </Flex>
  );
};

export default HamburgerMenu;
