import { ThemeColors } from "@/types";
import { AuthProvider } from "@/types/next-auth";
import { Box, Button, MenuItem, useTheme } from "@chakra-ui/react";
import React from "react";
import { handleSignIn } from "../authAction";

interface SignInMenuItemProps {
  _hover: { bg: string; color: string };
  leftIcon: React.ReactElement;
  text: string;
  provider: AuthProvider;
}

const SignInMenuItem = (props: SignInMenuItemProps) => {
  const theme: ThemeColors = useTheme();
  return (
    <Box as="form" onSubmit={() => handleSignIn(props.provider)}>
      <MenuItem
        _hover={props._hover}
        bg={theme.colors.background.body}
        color={theme.colors.text.body}
        type="submit"
      >
        <Button leftIcon={props.leftIcon} variant="">
          {props.text}
        </Button>
      </MenuItem>
    </Box>
  );
};

export default SignInMenuItem;
