import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import type { USER_ROLE_TYPES } from "@/server/drizzle/schema";

const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), customSessionClient<typeof auth>()],
});
export const { signIn, signOut } = authClient;

export type Session = Omit<typeof authClient.$Infer.Session, "user"> & {
  user: (typeof authClient.$Infer.Session)["user"] & { role: (typeof USER_ROLE_TYPES)[number] };
};

export const useSession = () => {
  const res = authClient.useSession();
  return { ...res, data: res.data as Session | null };
};
