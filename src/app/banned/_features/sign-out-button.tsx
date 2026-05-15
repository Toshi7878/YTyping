"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/auth/client";
import { Button } from "@/ui/button";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button type="button" variant="outline" onClick={handleSignOut}>
      サインアウト
    </Button>
  );
};
