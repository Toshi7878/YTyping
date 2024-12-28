"use client";
import { Box, Button, useTheme } from "@chakra-ui/react";

import { ThemeColors } from "@/types";
import { handleSignOut } from "../../../../../server/actions/authActions";

export function SignOutButton() {
  const theme: ThemeColors = useTheme();
  return (
    <Box
      as="form"
      action={async () => {
        await handleSignOut();
        window.location.reload();
      }}
    >
      <Button
        type="submit"
        variant="link"
        fontSize="xs"
        color={theme.colors.text.header.normal}
        _hover={{ color: theme.colors.text.header.hover }}
      >
        ログアウト
      </Button>
    </Box>
  );
}
