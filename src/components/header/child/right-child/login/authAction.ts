"use server";

import { signIn, signOut } from "@/server/auth";

export async function handleSignIn(provider: string) {
  await signIn(provider);
}

export async function handleSignOut() {
  await signOut();
}
