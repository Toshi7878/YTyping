import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/");
  }
  redirect(`/user/${userId}`);
}
