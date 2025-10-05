"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { LinkText } from "@/components/ui/typography";
import { useTRPC } from "@/trpc/provider";

export const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: userName } = useSuspenseQuery(trpc.userProfile.getUserName.queryOptions({ userId: Number(userId) }));

  return (
    <LinkText href={`/user/${userId}` as Route}>
      <span>{userName}</span>
    </LinkText>
  );
};
