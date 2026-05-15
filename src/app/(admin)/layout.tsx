import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/auth/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
