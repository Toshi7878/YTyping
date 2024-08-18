"use client";
import { Box, Button, useTheme } from "@chakra-ui/react";

import React from "react";
import { handleSignOut } from "./authAction";
import { ThemeColors } from "@/types";

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
        color={theme.colors.header.color}
        _hover={{ color: theme.colors.header.hover.color }}
      >
        ログアウト
      </Button>
    </Box>
  );
}