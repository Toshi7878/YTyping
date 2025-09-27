import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  redirect(`/user/${userId}`);
}
