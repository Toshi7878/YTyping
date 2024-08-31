import { SessionProvider } from "next-auth/react";
import NewNameDialog from "./NewNameDialog";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <NewNameDialog />
      </main>
    </SessionProvider>
  );
}
