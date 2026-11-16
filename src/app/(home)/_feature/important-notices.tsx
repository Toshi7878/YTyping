"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { ImportantNoticeLinkButton } from "@/shared/important-notice/link-button";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { toast } from "@/ui/toast";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";

/** ログイン中のユーザー宛ての、期限内で未確認の重要なお知らせ */
export const ImportantNotices = () => {
  const t = useTranslations("home.notices");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isLogin = !!session?.user?.id;

  const { data: notices } = useQuery(orpc.importantNotice.getActive.queryOptions({ enabled: isLogin }));

  const acknowledge = useMutation(
    orpc.importantNotice.acknowledge.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.importantNotice.getActive.key() }),
      onError: (error) => toast.error(tCommon("acknowledgeFailed", { message: error.message })),
    }),
  );

  if (!isLogin || !notices || notices.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" aria-label="Important notices">
      {notices.map((notice) => (
        <Card
          key={notice.id}
          className={cn(
            "flex flex-col gap-2 px-4 py-3",
            notice.level === "WARNING" ? "border-warning bg-warning/10" : "border-info bg-info/10",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              {notice.level === "WARNING" ? (
                <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
              ) : (
                <Info className="size-5 shrink-0 text-info" aria-hidden="true" />
              )}
              <p className="whitespace-pre-wrap break-words text-sm">{notice.body}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              disabled={acknowledge.isPending}
              onClick={() => acknowledge.mutate({ noticeId: notice.id })}
            >
              {tCommon("acknowledge")}
            </Button>
          </div>
          <ImportantNoticeLinkButton linkUrl={notice.linkUrl} linkLabel={notice.linkLabel} />
          {notice.expiresAt ? (
            <p className="text-muted-foreground text-xs">{t("expiresAt", { date: formatDate(notice.expiresAt) })}</p>
          ) : null}
        </Card>
      ))}
    </section>
  );
};
