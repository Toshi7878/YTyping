import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const RegisterLogoutButton = () => {
  return (
    <Button
      variant="unstyled"
      className="hover:text-header-foreground"
      onClick={async () => await signOut({ redirect: true })}
    >
      ログアウト
    </Button>
  );
};

export default RegisterLogoutButton;
