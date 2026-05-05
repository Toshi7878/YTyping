"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { useTRPC } from "@/app/_layout/trpc/provider";
import { LinkText } from "@/components/ui/typography";

export const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: profile } = useSuspenseQuery(trpc.user.profile.get.queryOptions({ userId: Number(userId) }));

  return (
    <LinkText href={`/user/${userId}` as Route}>
      <span>{profile?.name}</span>
    </LinkText>
  );
};
