import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createContext, useContext } from "react";
import type { auth } from "@/lib/auth";
import type { USER_ROLE_TYPES } from "@/server/drizzle/schema";

const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), customSessionClient<typeof auth>()],
});
export const { signIn, signOut, getSession } = authClient;

export type Session = Omit<typeof authClient.$Infer.Session, "user"> & {
  user: Omit<(typeof authClient.$Infer.Session)["user"], "id"> & { id: number; role: (typeof USER_ROLE_TYPES)[number] };
};

export const SessionContext = createContext<Session | null>(null);

const toSession = (raw: typeof authClient.$Infer.Session): Session => ({
  ...raw,
  user: { ...raw.user, id: Number(raw.user.id) } as Session["user"],
});

type UseSessionReturn = Omit<ReturnType<typeof authClient.useSession>, "data"> & {
  data: Session | null;
};

// Custom useSession hook to check both server and client session
export function useSession(): UseSessionReturn {
  const sessionContextData = useContext(SessionContext);
  const session = authClient.useSession();

  if (session.isPending && sessionContextData) {
    return { ...session, data: sessionContextData, isPending: false };
  }

  if (session.data) {
    return { ...session, data: toSession(session.data) };
  }

  return { ...session, data: null };
}
