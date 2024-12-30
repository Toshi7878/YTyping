"use client";
import { Button, useTheme } from "@chakra-ui/react";

import { ThemeColors } from "@/types";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function SignOutButton() {
  const theme: ThemeColors = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Button
      type="button"
      variant="link"
      fontSize="xs"
      color={theme.colors.text.header.normal}
      _hover={{ color: theme.colors.text.header.hover }}
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
