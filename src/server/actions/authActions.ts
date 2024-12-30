"use server";

import { signIn } from "@/server/auth";
import { AuthProvider } from "@/types/next-auth";

export async function handleSignIn(provider: AuthProvider) {
  await signIn(provider);
}
