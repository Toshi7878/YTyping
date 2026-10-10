"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/provider";
import { ContactExchange } from "@/shared/contact/thread";
import { CardWithContent } from "@/ui/card";

export const ContactHistory = () => {
  const { data: contacts } = useSuspenseQuery(orpc.contact.listMine.queryOptions());

  if (contacts.length === 0) {
    return <p className="py-6 text-center text-muted-foreground">お問い合わせの履歴はありません</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {contacts.map((contact) => (
        <CardWithContent key={contact.id}>
          <ContactExchange
            body={contact.body}
            createdAt={contact.createdAt}
            replyBody={contact.replyBody}
            repliedAt={contact.repliedAt}
          />
        </CardWithContent>
      ))}
    </div>
  );
};
