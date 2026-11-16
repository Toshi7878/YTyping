import { useProgress } from "@bprogress/next";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/auth/client";
import { Button } from "@/ui/button";

export const RegisterLogoutButton = () => {
  const t = useTranslations("layout.auth");
  const { start, stop } = useProgress();
  const router = useRouter();

  return (
    <Button
      variant="unstyled"
      className="hover:text-header-foreground"
      onClick={async () => {
        start();
        await signOut();
        stop();
        router.refresh();
      }}
    >
      {t("signOut")}
    </Button>
  );
};
