import type { REPORT_REASON_TYPES, REPORT_STATUS_TYPES } from "@/server/drizzle/schema";

export const REPORT_REASON_LABELS: Record<(typeof REPORT_REASON_TYPES)[number], string> = {
  CHEATING: "チート",
  HARASSMENT: "嫌がらせ",
  SPAM: "スパム",
  INAPPROPRIATE: "不適切なコンテンツ",
  OTHER: "その他",
};

export const getReportStatusBadgeVariant = (
  status: (typeof REPORT_STATUS_TYPES)[number],
  isReportedUserBanned: boolean,
) => {
  if (status === "PENDING") return "outline";
  if (status === "DISMISSED") return "secondary";
  if (status === "WARNED") return "warning";
  return isReportedUserBanned ? "destructive" : "secondary";
};

export const getReportStatusLabel = (status: (typeof REPORT_STATUS_TYPES)[number], isReportedUserBanned: boolean) => {
  if (status === "PENDING") return "未処理";
  if (status === "DISMISSED") return "対処不要";
  if (status === "WARNED") return "警告済み";
  return isReportedUserBanned ? "BAN済み" : "BAN解除済み";
};
