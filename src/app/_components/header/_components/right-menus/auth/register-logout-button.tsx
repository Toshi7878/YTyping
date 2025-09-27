import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const RegisterLogoutButton = () => {
  return (
    <Button variant="unstyled" className="hover:text-header-foreground" onClick={() => signOut({ redirect: true })}>
      ログアウト
    </Button>
  );
};

export default RegisterLogoutButton;
