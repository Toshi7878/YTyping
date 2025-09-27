"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import TextLink from "@/components/ui/text-link";
import { useTRPC } from "@/trpc/provider";

const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: userName } = useSuspenseQuery(trpc.userProfile.getUserName.queryOptions({ userId: Number(userId) }));

  return (
    <TextLink href={`/user/${userId}` as Route}>
      <span>{userName}</span>
    </TextLink>
  );
};

export default ByUser;
