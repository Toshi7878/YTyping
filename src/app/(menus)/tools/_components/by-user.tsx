"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { orpc } from "@/orpc/provider";
import { LinkText } from "@/ui/typography";

export const ByUser = ({ userId }: { userId: string }) => {
  const { data: profile } = useSuspenseQuery(orpc.user.profile.get.queryOptions({ input: { userId: Number(userId) } }));

  return (
    <LinkText href={`/user/${userId}` as Route}>
      <span>{profile?.name}</span>
    </LinkText>
  );
};
