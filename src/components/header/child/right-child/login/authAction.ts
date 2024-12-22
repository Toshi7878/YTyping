"use server";

import { signIn, signOut } from "@/server/auth";
import { AuthProvider } from "@/types/next-auth";

export async function handleSignIn(provider: AuthProvider) {
  await signIn(provider);
}

export async function handleSignOut() {
  await signOut();
}
