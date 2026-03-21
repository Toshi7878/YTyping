import type { Session } from "@/lib/auth-client";

export const hasMapUploadPermission = (session: Session | null, creatorId: number | null) => {
  if (!session) return false;
  if (session.user.role === "ADMIN") return true;
  if (!creatorId || creatorId === Number(session.user.id)) return true;
  return false;
};
