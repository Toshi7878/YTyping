"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/auth/client";
import { Button } from "@/ui/button";

export const SignOutButton = () => {
  const t = useTranslations("banned");
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button type="button" variant="outline" onClick={handleSignOut}>
      {t("signOut")}
    </Button>
  );
};
