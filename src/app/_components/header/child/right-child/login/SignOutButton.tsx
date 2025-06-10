"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button
      type="button"
      variant="link"
      className="text-foreground/80 hover:text-foreground h-auto p-0 text-xs font-normal"
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
}
