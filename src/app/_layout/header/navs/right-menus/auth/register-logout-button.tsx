import { useProgress } from "@bprogress/next";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/ui/button";

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
