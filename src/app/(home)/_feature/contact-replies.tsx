"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareReply } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/auth/client";
import { orpc } from "@/orpc/provider";
import { Button, buttonVariants } from "@/ui/button";
import { Card } from "@/ui/card";
import { toast } from "@/ui/toast";
import { formatDate } from "@/utils/date";

/** お問い合わせへの運営からの返信（未確認のもの）。重要なお知らせと同様に、確認すると非表示になる */
export const ContactReplies = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isLogin = !!session?.user?.id;

  const { data: replies } = useQuery(orpc.contact.getUnacknowledgedReplies.queryOptions({ enabled: isLogin }));

  const acknowledge = useMutation(
    orpc.contact.acknowledgeReply.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.contact.getUnacknowledgedReplies.key() }),
      onError: (error) => toast.error(`確認の記録に失敗しました: ${error.message}`),
    }),
  );

  if (!isLogin || !replies || replies.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" aria-label="お問い合わせへの返信">
      {replies.map((reply) => (
        <Card key={reply.id} className="flex flex-col gap-2 border-info bg-info/10 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <MessageSquareReply className="size-5 shrink-0 text-info" aria-hidden="true" />
              <h2 className="truncate font-bold">お問い合わせへの返信</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              disabled={acknowledge.isPending}
              onClick={() => acknowledge.mutate({ contactId: reply.id })}
            >
              確認しました
            </Button>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm">{reply.replyBody}</p>
          <p className="line-clamp-2 whitespace-pre-wrap break-words text-muted-foreground text-xs">
            お問い合わせ内容: {reply.body}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">{reply.repliedAt ? formatDate(reply.repliedAt) : null}</p>
            <Link href="/contact" className={buttonVariants({ variant: "link", size: "xs" })} prefetch={false}>
              お問い合わせ履歴を見る
            </Link>
          </div>
        </Card>
      ))}
    </section>
  );
};
