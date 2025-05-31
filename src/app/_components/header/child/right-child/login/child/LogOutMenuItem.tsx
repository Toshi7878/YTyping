import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useActionState } from "react";

const LogOutMenuItem = () => {
  const [, formAction] = useActionState(async () => {
    return await signOut({ redirect: false });
  }, null);

  return (
    <form action={formAction}>
      <Button variant="ghost" type="submit" size="sm" className="w-full justify-start">
        ログアウト
      </Button>
    </form>
  );
};

export default LogOutMenuItem;
