"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { ContactExchange } from "@/shared/contact/thread";
import { CardWithContent } from "@/ui/card";

export const ContactHistory = () => {
  const t = useTranslations("contactPage");
  const { data: contacts } = useSuspenseQuery(orpc.contact.listMine.queryOptions());

  if (contacts.length === 0) {
    return <p className="py-6 text-center text-muted-foreground">{t("empty")}</p>;
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
