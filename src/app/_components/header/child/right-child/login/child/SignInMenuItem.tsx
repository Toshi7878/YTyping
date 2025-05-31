import { handleSignIn } from "@/server/actions/authActions";
import { ThemeColors } from "@/types";
import { AuthProvider } from "@/types/next-auth";
import { Button, MenuItem, useTheme } from "@chakra-ui/react";
import React, { useActionState } from "react";

interface SignInMenuItemProps {
  _hover: { bg: string; color: string };
  leftIcon: React.ReactElement;
  text: string;
  provider: AuthProvider;
}

const SignInMenuItem = ({ _hover, leftIcon, text, provider }: SignInMenuItemProps) => {
  const [, formAction] = useActionState(async () => {
    return await handleSignIn(provider);
  }, null);
  const theme: ThemeColors = useTheme();

  return (
    <MenuItem as="form" action={formAction} _hover={_hover} bg={theme.colors.background.body}>
      <Button leftIcon={leftIcon} variant="ghost" type="submit" size="sm">
        {text}
      </Button>
    </MenuItem>
  );
};

export default SignInMenuItem;
