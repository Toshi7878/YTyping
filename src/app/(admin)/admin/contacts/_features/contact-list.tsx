"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { ContactExchange } from "@/shared/contact/thread";
import { UserNameLinkText } from "@/shared/user/user-name-link";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CardWithContent } from "@/ui/card";
import { Textarea } from "@/ui/textarea";
import { toast } from "@/ui/toast";
import { formatDate } from "@/utils/date";

type AdminContact = RouterOutputs["contact"]["adminList"][number];

export const ContactList = () => {
  const { data: contacts } = useSuspenseQuery(orpc.contact.adminList.queryOptions());
  const unansweredCount = contacts.filter((contact) => contact.replyBody === null).length;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-muted-foreground text-sm">
        未返信 <strong className="text-destructive">{unansweredCount}</strong> 件 / 全{contacts.length} 件
      </span>
      {contacts.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">お問い合わせはありません</p>
      ) : (
        contacts.map((contact) => <ContactItem key={contact.id} contact={contact} />)
      )}
    </div>
  );
};

const ContactItem = ({ contact }: { contact: AdminContact }) => {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: orpc.contact.adminList.key() });

  const replyMutation = useMutation(
    orpc.contact.reply.mutationOptions({
      onSuccess: async () => {
        toast.success("返信しました");
        setReply("");
        await invalidate();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <CardWithContent>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            <UserNameLinkText userId={contact.user.id} userName={contact.user.name} className="inline" /> /{" "}
            {formatDate(contact.createdAt)}
          </p>
        </div>
        {contact.replyBody === null ? <Badge variant="default">未返信</Badge> : null}
      </div>
      <ContactExchange
        body={contact.body}
        createdAt={contact.createdAt}
        replyBody={contact.replyBody}
        repliedAt={contact.repliedAt}
      />
      <div className="mt-3 flex flex-col gap-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder={
            contact.replyBody === null
              ? "返信内容（ユーザーのトップページに表示されます）"
              : "返信を書き直す場合は入力（上書きされ、ユーザーには改めて表示されます）"
          }
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            disabled={replyMutation.isPending || reply.trim() === ""}
            onClick={() => replyMutation.mutate({ contactId: contact.id, body: reply })}
          >
            {contact.replyBody === null ? "返信する" : "返信を上書きする"}
          </Button>
        </div>
      </div>
    </CardWithContent>
  );
};
