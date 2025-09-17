"use client";

import TextLink from "@/components/ui/text-link";
import { useTRPC } from "@/trpc/provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Route } from "next";

const ByUser = ({ userId }: { userId: string }) => {
  const trpc = useTRPC();
  const { data: userName } = useSuspenseQuery(trpc.user.getUserName.queryOptions({ userId: Number(userId) }));

  return (
    <TextLink href={`/user/${userId}` as Route}>
      <span>{userName}</span>
    </TextLink>
  );
};

export default ByUser;
