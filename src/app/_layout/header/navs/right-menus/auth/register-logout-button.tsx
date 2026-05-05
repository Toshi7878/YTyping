import { useProgress } from "@bprogress/next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export const RegisterLogoutButton = () => {
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
      ログアウト
    </Button>
  );
};
