import { ThemeColors } from "@/types";
import { Box, Button, MenuItem, useTheme } from "@chakra-ui/react";
import React from "react";
import { handleSignIn } from "../authAction";

interface SignInMenuItemProps {
  _hover: { bg: string; color: string };
  leftIcon: React.ReactElement;
  text: string;
}

const SignInMenuItem = (props: SignInMenuItemProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Box as="form" action={() => handleSignIn("google")}>
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
