import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export const RegisterLogoutButton = () => {
  return (
    <Button variant="unstyled" className="hover:text-header-foreground" onClick={() => signOut()}>
      ログアウト
    </Button>
  );
};
