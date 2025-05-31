import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/server/actions/authActions";
import { AuthProvider } from "@/types/next-auth";
import React, { useActionState } from "react";

interface SignInMenuItemProps {
  text: string;
  leftIcon: React.ReactNode;
  provider: string;
  className?: string;
}

const SignInMenuItem = ({ text, leftIcon, provider, className }: SignInMenuItemProps) => {
  const [, formAction] = useActionState(async () => {
    return await handleSignIn(provider as AuthProvider);
  }, null);

  return (
    <form action={formAction} className={className}>
      <Button variant="ghost" type="submit" size="sm" className="w-full justify-start gap-2">
        {leftIcon}
        {text}
      </Button>
    </form>
  );
};

export default SignInMenuItem;
