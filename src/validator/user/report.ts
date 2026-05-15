import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod/v4";
import { REPORT_REASON_TYPES, userReports } from "@/server/drizzle/schema";

export const userReportFormSchema = z.object({
  reason: z.enum(REPORT_REASON_TYPES),
  reasonDetail: z.string().max(500, "500文字以内で入力してください"),
});

export const userReportApiSchema = createInsertSchema(userReports).pick({
  reportedUserId: true,
  reason: true,
  reasonDetail: true,
});
