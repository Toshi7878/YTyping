import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const RegisterLogoutButton = () => {
  return (
    <Button variant="unstyled" className="hover:text-header-foreground" onClick={() => signOut({ redirect: true })}>
      ログアウト
    </Button>
  );
};
