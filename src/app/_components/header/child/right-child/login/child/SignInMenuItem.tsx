import { handleSignIn } from "@/server/actions/authActions";
import { ThemeColors } from "@/types";
import { AuthProvider } from "@/types/next-auth";
import { Button, MenuItem, useTheme } from "@chakra-ui/react";
import React from "react";
import { useFormState } from "react-dom";

interface SignInMenuItemProps {
  _hover: { bg: string; color: string };
  leftIcon: React.ReactElement;
  text: string;
  provider: AuthProvider;
}

const SignInMenuItem = (props: SignInMenuItemProps) => {
  const theme: ThemeColors = useTheme();
  const [, formAction] = useFormState(async () => {
    const result = await handleSignIn(props.provider);
    return result;
  }, null);
  return (
    <form action={formAction}>
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
    </form>
  );
};

export default SignInMenuItem;
