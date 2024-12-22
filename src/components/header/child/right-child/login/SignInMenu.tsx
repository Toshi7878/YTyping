import { ThemeColors } from "@/types";
import { Button, Menu, MenuButton, MenuList, useTheme } from "@chakra-ui/react";
import { BsDiscord, BsGoogle } from "react-icons/bs";
import SignInMenuItem from "./child/SignInMenuItem";

export default function SignInMenu() {
  const theme: ThemeColors = useTheme();

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="link"
        fontSize="xs"
        color={theme.colors.text.header.normal}
        _hover={{ color: theme.colors.text.header.hover }}
        _active={{ color: theme.colors.text.header.hover }}
        className="dropdown-toggle"
      >
        ログイン
      </MenuButton>
      <MenuList bg={theme.colors.background.body}>
        <SignInMenuItem
          _hover={{ bg: "#7289DA", color: "white" }}
          text={"Discordでログイン"}
          leftIcon={<BsDiscord size="1.5em" />}
          provider={"discord"}
        />
        <SignInMenuItem
          _hover={{ bg: "#DB4437", color: "white" }}
          text={"Googleでログイン"}
          leftIcon={<BsGoogle size="1.5em" />}
          provider={"google"}
        />
      </MenuList>
    </Menu>
  );
}
