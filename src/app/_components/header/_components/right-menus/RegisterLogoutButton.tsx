"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const RegisterLogoutButton = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Button
      variant="unstyled"
      className="hover:text-foreground"
      onClick={async () => {
        await signOut({ redirect: false });
        if (pathname === "/user/register") {
          router.push("/");
        }
      }}
    >
      ログアウト
    </Button>
  );
};

export default RegisterLogoutButton;
