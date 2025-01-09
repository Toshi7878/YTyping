import { loginMenuItem } from "@/config/headerNav";
import { ThemeColors } from "@/types";
import { Menu, MenuButton, MenuDivider, MenuList, useTheme } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import LinkMenuItem from "../../child/LinkMenuItem";
import LogOutMenuItem from "./child/LogOutMenuItem";

export default function UserMenu() {
  const { data: session } = useSession();
  const theme: ThemeColors = useTheme();

  return (
    <Menu placement="bottom">
      <MenuButton
        fontSize="sm"
        color={theme.colors.text.header.normal}
        _hover={{
          color: theme.colors.text.header.hover,
        }}
        _active={{ color: theme.colors.text.header.hover }}
        className="dropdown-toggle"
      >
        {session?.user?.name ? session?.user?.name : "名前未設定"}
      </MenuButton>
      <MenuList bg={theme.colors.background.body} minW="fit-content">
        {loginMenuItem.map((item, index) => {
          return <LinkMenuItem key={index} title={item.title} href={item.href} />;
        })}

        <MenuDivider />

        <LogOutMenuItem />
      </MenuList>
    </Menu>
  );
}
