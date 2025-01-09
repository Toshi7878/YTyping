import { ThemeColors } from "@/types";
import { MenuItem, useTheme } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

const LogOutMenuItem = () => {
  const theme: ThemeColors = useTheme();

  return (
    <MenuItem
      type="button"
      fontSize="sm"
      bg={theme.colors.background.body}
      _hover={{
        bg: theme.colors.background.header,
      }}
      color={theme.colors.text.body}
      onClick={() => {
        signOut({ redirect: false });
      }}
    >
      ログアウト
    </MenuItem>
  );
};

export default LogOutMenuItem;
