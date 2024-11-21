import { Box, MenuItem, useTheme } from "@chakra-ui/react";
import React from "react";
import { handleSignOut } from "../authAction";
import { ThemeColors } from "@/types";

const LogOutMenuItem = () => {
  const theme: ThemeColors = useTheme();

  const submitSignOut = async () => {
    await handleSignOut();
    window.location.reload();
  };

  return (
    <Box as="form" action={submitSignOut}>
      <MenuItem
        type="submit"
        fontSize="sm"
        bg={theme.colors.background.body}
        _hover={{
          bg: theme.colors.background.header,
        }}
        color={theme.colors.text.body}
      >
        ログアウト
      </MenuItem>
    </Box>
  );
};

export default LogOutMenuItem;
