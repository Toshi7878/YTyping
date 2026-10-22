import { ShieldBanIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/auth/server";
import { SignOutButton } from "./_features/sign-out-button";

export default async function BannedPage() {
  const t = await getTranslations("banned");
  const session = await getSession();

  if (!session) redirect("/");
  if (!session.user.banned) redirect("/");

  const banReason = session.user.banReason;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <ShieldBanIcon className="size-16 text-destructive" />
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      {banReason && (
        <div className="w-full max-w-md rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-4 text-left">
          <p className="mb-1 font-medium text-destructive text-sm">{t("reason")}</p>
          <p className="text-sm">{banReason}</p>
        </div>
      )}
      <SignOutButton />
    </div>
  );
}
